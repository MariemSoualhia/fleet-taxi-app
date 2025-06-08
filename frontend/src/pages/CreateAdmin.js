import React from "react";
import { Form, Input, Button, Select, message } from "antd";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const { Option } = Select;

function CreateAdmin({ onSuccess, onCancel }) {
  const { token } = useAuth();

  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register-admin",
        {
          name: values.name,
          email: values.email,
          password: values.password,
          role: "admin", // fixe ici le rôle admin, sinon tu peux rendre dynamique
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("Admin créé avec succès !");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erreur création admin:", error);
      const errMsg =
        error.response?.data?.message ||
        "Erreur lors de la création de l'admin";
      message.error(errMsg);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ role: "admin" }}
    >
      <Form.Item
        name="name"
        label="Nom"
        rules={[{ required: true, message: "Veuillez entrer le nom" }]}
      >
        <Input placeholder="Nom complet" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Veuillez entrer l'email" },
          { type: "email", message: "Email invalide" },
        ]}
      >
        <Input placeholder="email@example.com" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mot de passe"
        rules={[
          { required: true, message: "Veuillez entrer un mot de passe" },
          {
            min: 6,
            message: "Le mot de passe doit faire au moins 6 caractères",
          },
        ]}
      >
        <Input.Password placeholder="Mot de passe" />
      </Form.Item>

      {/* Optionnel si tu veux un select de rôles (mais ici on fixe admin) */}
      {/* <Form.Item name="role" label="Rôle">
        <Select disabled>
          <Option value="admin">Admin</Option>
        </Select>
      </Form.Item> */}

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
          Créer
        </Button>
        <Button onClick={onCancel}>Annuler</Button>
      </Form.Item>
    </Form>
  );
}

export default CreateAdmin;
