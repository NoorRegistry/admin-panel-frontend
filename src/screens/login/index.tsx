import constants from "@/constants";
import { googleLogin, ILoginPayload, login } from "@/services/login.service";
import { useGlobalStore } from "@/store";
import { setStorageItem } from "@/utils/storage";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, Row } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { useTranslation } from "react-i18next";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const signin = useGlobalStore.use.signIn();
  const router = useRouter();

  const handleLoginMutation = useMutation({
    mutationFn: (data: ILoginPayload) => login(data),
    onSuccess: (response) => {
      setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(response));
      signin();
      router.replace("/");
    },
    onError: () => {},
  });

  const onFinish = (values: ILoginPayload) => {
    handleLoginMutation.mutate(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("No credential received");
      return;
    }

    const token = credentialResponse.credential;
    const response = await googleLogin(token);
    console.log("response", response);
  };

  return (
    <>
      <Row
        align="middle"
        justify="center"
        style={{ height: "100vh", backgroundColor: "#f0f2f5" }}
      >
        <Col>
          <Card
            title={t("login.loginToAccount")}
            style={{ width: 300, borderRadius: 8 }}
          >
            <Form
              name="login"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              size="large"
              clearOnDestroy
            >
              <Form.Item
                name="email"
                label={t("common.email")}
                rules={[
                  { required: true, message: t("login.enterEmail") },
                  { type: "email", message: t("login.enterValidEmail") },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="password"
                label={t("login.password")}
                rules={[{ required: true, message: t("login.enterPassword") }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={handleLoginMutation.isPending}
                >
                  {t("login.login")}
                </Button>
              </Form.Item>
            </Form>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log("Login Failed")}
              useOneTap
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default LoginScreen;
