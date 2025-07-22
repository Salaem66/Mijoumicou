import { RecommendationResponse, MoodAnalysis, Game } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getRecommendations(mood: string, libraryOnly: boolean = false, gameIds: string[] = []): Promise<RecommendationResponse> {
    return this.request<RecommendationResponse>('/recommend/advanced', {
      method: 'POST',
      body: JSON.stringify({ mood, libraryOnly, gameIds }),
    });
  }

  async getRecommendationsAdvanced(options: {
    mood: string;
    libraryOnly?: boolean;
    gameIds?: string[];
  }): Promise<RecommendationResponse & {
    suggestions: string[];
    meta: {
      total_games_analyzed: number;
      games_with_score: number;
      library_only: boolean;
    };
  }> {
    return this.request('/recommend/advanced', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async analyzeMood(mood: string): Promise<{ user_input: string; analysis: MoodAnalysis }> {
    return this.request<{ user_input: string; analysis: MoodAnalysis }>('/analyze/mood', {
      method: 'POST',
      body: JSON.stringify({ mood }),
    });
  }

  async getAllGames(): Promise<Game[]> {
    const response = await this.request<{ games?: Game[] } | Game[]>('/games');
    // Handle both formats: { games: [] } or []
    return Array.isArray(response) ? response : (response.games || []);
  }

  async getGamesByType(type: string): Promise<Game[]> {
    return this.request<Game[]>(`/games/type/${type}`);
  }

  async searchByTags(tags: string[]): Promise<Game[]> {
    return this.request<Game[]>('/search/tags', {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  async getSimilarGames(gameId: number): Promise<{ target_game: Game; similar_games: Game[] }> {
    return this.request<{ target_game: Game; similar_games: Game[] }>(`/games/${gameId}/similar`);
  }

  async getStats(): Promise<{
    total_games: number;
    by_type: { [key: string]: number };
    by_complexity: { [key: string]: number };
    average_duration: number;
    complexity_range: { min: number; max: number };
    duration_range: { min: number; max: number };
  }> {
    return this.request('/stats');
  }

  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    features: string[];
  }> {
    return this.request('/health');
  }

  async getTrends(): Promise<{
    trends: {
      mostPopularTags: [string, number][];
      complexityDistribution: number[];
      durationDistribution: { [key: string]: number };
    };
    totalGames: number;
    timestamp: string;
  }> {
    return this.request('/trends');
  }

  async addGame(gameData: any): Promise<{
    success: boolean;
    game: Game;
    message: string;
  }> {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async updateGame(id: number, gameData: any): Promise<{
    success: boolean;
    game: Game;
    message: string;
  }> {
    return this.request(`/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gameData),
    });
  }

  async deleteGame(id: number): Promise<{
    success: boolean;
    message: string;
    deletedId: number;
  }> {
    return this.request(`/games/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;