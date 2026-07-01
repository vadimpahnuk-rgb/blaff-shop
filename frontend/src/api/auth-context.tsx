import { createContext, useContext } from 'react';
import type { User } from '../types';

export interface AuthCtx { user: User | null; isAdmin: boolean; }
export const AuthContext = createContext<AuthCtx>({ user: null, isAdmin: false });
export const useAuth = () => useContext(AuthContext);
