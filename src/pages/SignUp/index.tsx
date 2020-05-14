import React, { useRef, useState, useCallback } from 'react';
import {
  Image,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import Icon from 'react-native-vector-icons/Feather';

import Input from '../../components/Input';
import Button from '../../components/Button';

import logoImg from '../../assets/logo.png';

import { Container, Title, BackToSignIn, BackToSignInText } from './styles';

const SignUp: React.FC = () => {
  const [changeInput, setChangeInput] = useState(false);

  const navigation = useNavigation();
  const formRef = useRef<FormHandles>(null);

  const emailInpuRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const scrollChange = useRef<ScrollView>(null);

  return (
    <>
      <ScrollView
        ref={scrollChange}
        keyboardShouldPersistTaps="handled"
        pointerEvents="auto"
        automaticallyAdjustContentInsets
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={
          !changeInput
            ? () => scrollChange.current?.scrollTo({ x: 0, y: 250 })
            : undefined
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 64}
          style={{ flex: 1 }}
        >
          <Container>
            <Image source={logoImg} />

            <View>
              <Title>Crie sua conta</Title>
            </View>
            <Form
              ref={formRef}
              onSubmit={(data) => {
                console.log(data);
              }}
            >
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInpuRef.current?.focus();
                  setChangeInput(true);
                  setChangeInput(false);
                }}
              />
              <Input
                ref={emailInpuRef}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                  setChangeInput(true);
                  setChangeInput(false);
                }}
              />
              <Input
                ref={passwordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Senha"
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                  setChangeInput(true);
                }}
              />

              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}
              >
                Cadastrar
              </Button>
            </Form>
          </Container>
        </KeyboardAvoidingView>
      </ScrollView>
      <BackToSignIn onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={20} color="#fff" />
        <BackToSignInText>Voltar para logon</BackToSignInText>
      </BackToSignIn>
    </>
  );
};

export default SignUp;
