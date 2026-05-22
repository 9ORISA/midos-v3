import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface User {
  id: number;
  username: string;
  role: string;
}

interface Stats {
  visited: number;
  completed: number;
  total: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  videos: number;
  inventoryCount: number;
  currentLocation: string | null;
  youtubeSubs?: number | null;
}

interface Governorate {
  id: number;
  name: string;
  name_ar: string;
  x_position: number;
  y_position: number;
  region: string;
  visited: number;
  completed: number;
  visit_day: number | null;
  story: string;
  youtube_url?: string | null;
}

interface InventoryItem {
  id: number;
  name: string;
  image: string | null;
  quantity: number;
  price: number;
  description: string;
  created_at: string;
  updated_at: string;
}

interface BalanceLog {
  id: number;
  day_number: number;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  log_date: string;
}

export interface Vote {
  email: string;
  cookie: string;
  vote: number;
}

export interface GovPoll {
  id: number;
  question: string;
  goves: number[];
  votes: Vote[];
  next_gov_id: number | null;
  image: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  
  stats: Stats | null;
  governorates: Governorate[];
  inventory: InventoryItem[];
  logs: BalanceLog[];
  polls: GovPoll[];
  dbConnected: boolean;
  loading: boolean;
  
  refreshData: () => Promise<void>;
  updateGovernorate: (id: number, data: Partial<Governorate>) => Promise<void>;
  addGovernorate: (data: object) => Promise<void>;
  deleteGovernorate: (id: number) => Promise<void>;
  addInventoryItem: (data: object) => Promise<void>;
  updateInventoryItem: (id: number, data: object) => Promise<void>;
  deleteInventoryItem: (id: number) => Promise<void>;
  sellInventoryItem: (id: number, quantity: number, dayNumber: number, sellPrice: number) => Promise<{ earnings: number; balance: number } | null>;
  addLog: (day: number, type: 'earned' | 'spent', amount: number, description: string) => Promise<void>;
  deleteLog: (id: number) => Promise<void>;
  
  addPoll: (data: { question: string; goves: number[]; image: string | null; end_time: string | null; next_gov_id: number | null }) => Promise<void>;
  votePoll: (pollId: number, email: string, cookie: string, vote: number) => Promise<boolean>;
  updatePoll: (id: number, data: Partial<GovPoll>) => Promise<void>;
  deletePoll: (id: number) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [stats, setStats] = useState<Stats | null>(null);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<BalanceLog[]>([]);
  const [polls, setPolls] = useState<GovPoll[]>([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const authHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    checkHealth();
    if (token) verifyToken();
    refreshData();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      setDbConnected(data.database === 'connected');
    } catch {
      setDbConnected(false);
    }
  };

  const verifyToken = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (!res.ok) return false;
      
      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [statsRes, govRes, invRes, logsRes, pollsRes] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/governorates`),
        fetch(`${API_URL}/inventory`),
        fetch(`${API_URL}/logs`),
        fetch(`${API_URL}/polls`)
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (govRes.ok) setGovernorates(await govRes.json());
      if (invRes.ok) setInventory(await invRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (pollsRes.ok) setPolls(await pollsRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  };

  const updateGovernorate = async (id: number, data: Partial<Governorate>) => {
    try {
      await fetch(`${API_URL}/governorates/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to update governorate:', err);
    }
  };

  const addInventoryItem = async (data: object) => {
    try {
      await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const updateInventoryItem = async (id: number, data: object) => {
    try {
      await fetch(`${API_URL}/inventory/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const deleteInventoryItem = async (id: number) => {
    try {
      await fetch(`${API_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const sellInventoryItem = async (id: number, quantity: number, dayNumber: number, sellPrice: number) => {
    try {
      const res = await fetch(`${API_URL}/inventory/${id}/sell`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ quantity, day_number: dayNumber, sell_price: sellPrice })
      });
      if (!res.ok) return null;
      const data = await res.json();
      await refreshData();
      return { earnings: data.earnings, balance: data.balance };
    } catch (err) {
      console.error('Failed to sell item:', err);
      return null;
    }
  };

  const addGovernorate = async (data: object) => {
    try {
      await fetch(`${API_URL}/governorates`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to add governorate:', err);
    }
  };

  const deleteGovernorate = async (id: number) => {
    try {
      await fetch(`${API_URL}/governorates/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to delete governorate:', err);
    }
  };

  const addLog = async (day: number, type: 'earned' | 'spent', amount: number, description: string) => {
    try {
      await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ day_number: day, type, amount, description })
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to add log:', err);
    }
  };

  const deleteLog = async (id: number) => {
    try {
      await fetch(`${API_URL}/logs/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to delete log:', err);
    }
  };

  const addPoll = async (data: { question: string; goves: number[]; image: string | null; end_time: string | null; next_gov_id: number | null }) => {
    try {
      await fetch(`${API_URL}/polls`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to add poll:', err);
    }
  };

  const votePoll = async (pollId: number, email: string, cookie: string, vote: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cookie, vote })
      });
      if (res.ok) {
        await refreshData();
        return true;
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to submit vote');
        return false;
      }
    } catch (err) {
      console.error('Failed to vote:', err);
      return false;
    }
  };

  const updatePoll = async (id: number, data: Partial<GovPoll>) => {
    try {
      await fetch(`${API_URL}/polls/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to update poll:', err);
    }
  };

  const deletePoll = async (id: number) => {
    try {
      await fetch(`${API_URL}/polls/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to delete poll:', err);
    }
  };

  return (
    <ApiContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user,
      stats,
      governorates,
      inventory,
      logs,
      polls,
      dbConnected,
      loading,
      refreshData,
      updateGovernorate,
      addGovernorate,
      deleteGovernorate,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      sellInventoryItem,
      addLog,
      deleteLog,
      addPoll,
      votePoll,
      updatePoll,
      deletePoll
    }}>
      {children}
    </ApiContext.Provider>
  );
}

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) throw new Error('useApi must be used within ApiProvider');
  return context;
};
