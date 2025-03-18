import { useState} from "react";
import { Link } from 'react-router-dom';
import { Form, Input, Button, Card } from "antd";
import useAuth from "../../hooks/useAuth";


const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { registerMutation} = useAuth();
  const handleSubmit = () => {
    registerMutation.mutate({ username, password, name });
  };

  
  return (
    <Card title="Register" style={{ width: 300, margin: "auto", marginTop: "11%" }}>
      <Form>
        <Form.Item label="Username">
          <Input  placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </Form.Item>
        <Form.Item label="Name">
          <Input  placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)}  />
        </Form.Item>
        <Form.Item label="Password">
          <Input.Password  placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Item>
        <p style={{ marginTop: 10 }}>
        Already have an account?<Link to="/login"> Login</Link>
        </p>
        <Button type="primary" onClick={handleSubmit} block>
          Register
        </Button>
      </Form>
    </Card>
  );
}

export default Register
