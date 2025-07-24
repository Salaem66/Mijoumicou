// Service de cache pour la bibliothèque utilisateur
// Évite les requêtes multiples et améliore les performances

class LibraryCacheService {
  private cache = new Map<string, boolean>();
  private loadingPromises = new Map<string, Promise<Set<number>>>();
  private failedRequests = new Set<string>(); // Circuit breaker pour éviter les boucles

  // Génère une clé de cache
  private getCacheKey(userId: string, gameId: number): string {
    return `${userId}-${gameId}`;
  }

  // Vérifie si un jeu est en cache
  isInCache(userId: string, gameId: number): boolean {
    return this.cache.has(this.getCacheKey(userId, gameId));
  }

  // Récupère un jeu depuis le cache
  getFromCache(userId: string, gameId: number): boolean | undefined {
    return this.cache.get(this.getCacheKey(userId, gameId));
  }

  // Met en cache un jeu
  setInCache(userId: string, gameId: number, inLibrary: boolean): void {
    this.cache.set(this.getCacheKey(userId, gameId), inLibrary);
  }

  // Charge toute la bibliothèque et met en cache (évite les requêtes multiples)
  async loadUserLibrary(userId: string, libraryService: any): Promise<Set<number>> {
    // Circuit breaker : si cette requête a déjà échoué, retourner un set vide
    if (this.failedRequests.has(userId)) {
      console.warn(`🔴 Circuit breaker activé pour userId: ${userId}`);
      return new Set<number>();
    }

    // Si une requête est déjà en cours, attendre le résultat
    if (this.loadingPromises.has(userId)) {
      return this.loadingPromises.get(userId)!;
    }

    // Créer une nouvelle promesse de chargement
    const loadingPromise: Promise<Set<number>> = (async () => {
      try {
        console.log(`🔄 Chargement bibliothèque depuis Supabase pour: ${userId}`);
        const libraryData = await libraryService.getUserLibrary(userId);
        const gameIds = new Set<number>(libraryData.map((item: any) => Number(item.game_id)));

        // Mettre en cache tous les jeux de la bibliothèque
        libraryData.forEach((item: any) => {
          this.setInCache(userId, Number(item.game_id), true);
        });

        console.log(`✅ Bibliothèque mise en cache: ${gameIds.size} jeux`);
        return gameIds;
      } catch (error) {
        console.error('❌ Erreur lors du chargement de la bibliothèque:', error);
        // Activer le circuit breaker pour éviter les boucles
        this.failedRequests.add(userId);
        // Désactiver après 30 secondes
        setTimeout(() => this.failedRequests.delete(userId), 30000);
        return new Set<number>();
      } finally {
        // Nettoyer la promesse après completion
        this.loadingPromises.delete(userId);
      }
    })();

    // Stocker la promesse pour éviter les requêtes multiples
    this.loadingPromises.set(userId, loadingPromise);
    return loadingPromise;
  }

  // Invalide le cache pour un utilisateur (utile après modifications)
  invalidateUserCache(userId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(`${userId}-`));
    keysToDelete.forEach(key => this.cache.delete(key));
    this.loadingPromises.delete(userId);
  }

  // Vide tout le cache
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  // Debug: affiche le contenu du cache
  debugCache(): void {
    console.log('Library Cache:', Object.fromEntries(this.cache));
  }
}

// Instance singleton
export const libraryCacheService = new LibraryCacheService();