export interface AuthState {
  loading: boolean;
  token: string | null;
  error: string | null;
  authChecked: boolean;

  roles: { id: number; name: string }[];
  rolesLoading: boolean;
  rolesError: string | null;
  selectedRole?: { id: number; name: string };
}
