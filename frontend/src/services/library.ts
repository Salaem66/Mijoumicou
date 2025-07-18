import { Game } from '../types';

// Interface pour la bibliothèque utilisateur
export interface UserLibrary {
  games: string[]; // IDs des jeux
  lastUpdated: string;
  version: string;
}

// Configuration pour basculer entre local et cloud
const STORAGE_CONFIG = {
  useCloud: false, // Basculer à true pour le cloud
  localStorageKey: 'mijoumicou_library',
  version: '1.0.0'
};

class LibraryService {
  private library: UserLibrary;

  constructor() {
    this.library = this.loadLibrary();
  }

  // Charger la bibliothèque (local pour le POC, cloud plus tard)
  private loadLibrary(): UserLibrary {
    if (STORAGE_CONFIG.useCloud) {
      // TODO: Implémenter le chargement depuis le cloud
      return this.loadFromCloud();
    } else {
      return this.loadFromLocal();
    }
  }

  // Chargement depuis le localStorage
  private loadFromLocal(): UserLibrary {
    try {
      const stored = localStorage.getItem(STORAGE_CONFIG.localStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Vérifier la version pour la migration future
        if (parsed.version === STORAGE_CONFIG.version) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la bibliothèque:', error);
    }

    // Bibliothèque par défaut
    return {
      games: [],
      lastUpdated: new Date().toISOString(),
      version: STORAGE_CONFIG.version
    };
  }

  // Chargement depuis le cloud (à implémenter)
  private loadFromCloud(): UserLibrary {
    // TODO: Implémenter l'API cloud
    // return await fetch('/api/user/library').then(res => res.json());
    console.log('Cloud storage not implemented yet');
    return this.loadFromLocal();
  }

  // Sauvegarder la bibliothèque
  private saveLibrary(): void {
    this.library.lastUpdated = new Date().toISOString();
    
    if (STORAGE_CONFIG.useCloud) {
      this.saveToCloud();
    } else {
      this.saveToLocal();
    }
  }

  // Sauvegarde locale
  private saveToLocal(): void {
    try {
      localStorage.setItem(STORAGE_CONFIG.localStorageKey, JSON.stringify(this.library));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la bibliothèque:', error);
    }
  }

  // Sauvegarde cloud (à implémenter)
  private saveToCloud(): void {
    // TODO: Implémenter l'API cloud
    // await fetch('/api/user/library', { method: 'POST', body: JSON.stringify(this.library) });
    console.log('Cloud storage not implemented yet');
    this.saveToLocal(); // Fallback vers local
  }

  // Ajouter un jeu à la bibliothèque
  addGame(gameId: string): boolean {
    if (!this.library.games.includes(gameId)) {
      this.library.games.push(gameId);
      this.saveLibrary();
      return true;
    }
    return false;
  }

  // Retirer un jeu de la bibliothèque
  removeGame(gameId: string): boolean {
    const index = this.library.games.indexOf(gameId);
    if (index > -1) {
      this.library.games.splice(index, 1);
      this.saveLibrary();
      return true;
    }
    return false;
  }

  // Vérifier si un jeu est dans la bibliothèque
  hasGame(gameId: string): boolean {
    return this.library.games.includes(gameId);
  }

  // Obtenir tous les IDs des jeux de la bibliothèque
  getGameIds(): string[] {
    return [...this.library.games];
  }

  // Obtenir le nombre de jeux dans la bibliothèque
  getGameCount(): number {
    return this.library.games.length;
  }

  // Filtrer une liste de jeux selon la bibliothèque
  filterGamesInLibrary(games: Game[]): Game[] {
    return games.filter(game => this.hasGame(game.id.toString()));
  }

  // Marquer les jeux selon leur présence dans la bibliothèque
  markGamesWithLibraryStatus(games: Game[]): Game[] {
    return games.map(game => ({
      ...game,
      inLibrary: this.hasGame(game.id.toString())
    }));
  }

  // Exporter la bibliothèque (pour backup)
  exportLibrary(): string {
    return JSON.stringify(this.library, null, 2);
  }

  // Importer une bibliothèque (pour restore)
  importLibrary(libraryData: string): boolean {
    try {
      const imported = JSON.parse(libraryData);
      if (imported.games && Array.isArray(imported.games)) {
        this.library = {
          games: imported.games,
          lastUpdated: new Date().toISOString(),
          version: STORAGE_CONFIG.version
        };
        this.saveLibrary();
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
    }
    return false;
  }

  // Vider la bibliothèque
  clearLibrary(): void {
    this.library.games = [];
    this.saveLibrary();
  }

  // Obtenir les statistiques de la bibliothèque
  getLibraryStats(): {
    totalGames: number;
    lastUpdated: string;
    version: string;
  } {
    return {
      totalGames: this.library.games.length,
      lastUpdated: this.library.lastUpdated,
      version: this.library.version
    };
  }

  // Préparer la migration vers le cloud
  async migrateToCloud(): Promise<boolean> {
    if (STORAGE_CONFIG.useCloud) {
      console.log('Already using cloud storage');
      return true;
    }

    try {
      // TODO: Implémenter la migration
      // await this.saveToCloud();
      // STORAGE_CONFIG.useCloud = true;
      console.log('Cloud migration not implemented yet');
      return false;
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
      return false;
    }
  }
}

// Instance singleton
export const libraryService = new LibraryService();

// Hook React pour utiliser la bibliothèque
export const useLibrary = () => {
  const addGame = (gameId: string) => libraryService.addGame(gameId);
  const removeGame = (gameId: string) => libraryService.removeGame(gameId);
  const hasGame = (gameId: string) => libraryService.hasGame(gameId);
  const getGameCount = () => libraryService.getGameCount();
  const getGameIds = () => libraryService.getGameIds();
  const filterGamesInLibrary = (games: Game[]) => libraryService.filterGamesInLibrary(games);
  const markGamesWithLibraryStatus = (games: Game[]) => libraryService.markGamesWithLibraryStatus(games);
  const clearLibrary = () => libraryService.clearLibrary();
  const getLibraryStats = () => libraryService.getLibraryStats();
  const exportLibrary = () => libraryService.exportLibrary();
  const importLibrary = (data: string) => libraryService.importLibrary(data);

  return {
    addGame,
    removeGame,
    hasGame,
    getGameCount,
    getGameIds,
    filterGamesInLibrary,
    markGamesWithLibraryStatus,
    clearLibrary,
    getLibraryStats,
    exportLibrary,
    importLibrary
  };
};