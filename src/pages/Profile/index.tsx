import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-picker';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  BackButton,
  Title,
  UserAvatarButton,
  UserAvatar,
  ButtonSignOut,
} from './styles';
import { useAuth } from '../../hooks/auth';

interface SignUpFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const SignUp: React.FC = () => {
  const { user, updateUser, signOut } = useAuth();
  const [changeInput, setChangeInput] = useState(false);

  const navigation = useNavigation();
  const formRef = useRef<FormHandles>(null);

  const emailInpuRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const scrollChange = useRef<ScrollView>(null);

  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome Obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string().required(),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: (val) => !!val.length,
              then: Yup.string().required(),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), null], 'A confirmação está diferente'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso!');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }
        // disparar um toast
        Alert.alert(
          'Erro na atualização do perfil',
          'Ocorreu um erro ao atualizar os dados, tente novamente',
        );
      }
    },
    [navigation, updateUser],
  );

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Selecione uma foto',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar a Câmera',
        chooseFromLibraryButtonTitle: 'Escolher da galeria',
      },
      async(response)  => {
        if (response.didCancel) {
          return;
        }
        if (response.error) {
          Alert.alert('Erro ao atualizar sua foto');
          return;
        }

        const data = new FormData();

        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: response.uri,
        });
        console.log("esse é o data: " + data);
        const res = await api.patch('/users/avatar', data);

        updateUser(res.data);
      },
    );
  }, [updateUser, user.id]);


  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

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
            ? () => scrollChange.current?.scrollTo({ x: 0, y: 0 })
            : undefined
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 64}
          style={{ flex: 1 }}
        >
          <Container>
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>
            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>
            <View>
              <Title>Meu perfil</Title>
            </View>
            <Form initialData={user} ref={formRef} onSubmit={handleSignUp}>
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
                  oldPasswordInputRef.current?.focus();
                  setChangeInput(true);
                  setChangeInput(false);
                }}
              />
              <Input
                ref={oldPasswordInputRef}
                secureTextEntry
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                textContentType="newPassword"
                returnKeyType="next"
                containerStyle={{ marginTop: 16 }}
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                  setChangeInput(true);
                }}
              />
              <Input
                ref={passwordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Nova Senha"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus();
                  setChangeInput(true);
                }}
              />
              <Input
                ref={confirmPasswordInputRef}
                secureTextEntry
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar senha"
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                  setChangeInput(true);
                }}
              />

              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}
              >
                Confirmar mudança
              </Button>
            </Form>
            <ButtonSignOut onPress={handleSignOut}>
              <Icon name="log-out" size={24} color="#999591" />
            </ButtonSignOut>
          </Container>
        </KeyboardAvoidingView>
      </ScrollView>
    </>
  );
};

export default SignUp;
