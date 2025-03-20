import API from "@/utils/API"
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useStore } from "@/hooks/useStore";

const Login = async ({ username, password }) => {
  const response = await API.post("/auth", { username, password });
  if (response.status === 200) {
    return response.data;
  }
  throw new Error("Login failed!");
}

const Register = async ({ username, password, name }) => {
  const response = await API.post("/users", { username, password, name });
  if (response.status === 201) {
    return response.data;
  }
  throw new Error("Registration failed!");
}
const useAuth = () => {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const loginMutation = useMutation({
    mutationFn: Login,
    onSuccess(data) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); 
      setUser(data.user); 
      navigate("/");
      toast.success("Login successful!");
    },
    onError() {
      toast.error('Login failed!');
    },
  });

  const registerMutation = useMutation({
    mutationFn: Register,
    onSuccess(data) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); 
      setUser(data.user);
      navigate("/");
      toast.success("Registration successful!");
    },
    onError() {
      toast.error('Registration failed!');
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return {
    loginMutation,
    registerMutation,
    logout
  };
};

export default useAuth