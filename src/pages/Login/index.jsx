import { useState,} from "react";
import { Link, Navigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from "antd";
import useAuth from "../../hooks/useAuth";
import './style.css'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { loginMutation} = useAuth();
    if(localStorage.getItem('token')){
        return <Navigate to='/' replace />;
    }
    const handleSubmit = () => {
      loginMutation.mutate({ username, password });
    };
        
    
      return (
        <Card title="Login" style={{ width: 300, margin: "auto", marginTop: "15%" }}>
          <Form>
            <Form.Item label="Username">
              <Input  placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Item>
            <Form.Item label="Password">
              <Input.Password  placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Item>
            <p style={{ marginTop: 10 }}>
            Don't have an account?<Link to="/register"> Register</Link>
            </p>
            <Button type="primary" onClick={handleSubmit} block>
              Login
            </Button>
          </Form>
        </Card>
      );
    };

export default Login
