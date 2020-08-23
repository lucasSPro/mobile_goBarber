/* eslint-disable @typescript-eslint/camelcase */
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Platform, Alert } from 'react-native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import defaultAvatar from '../../assets/defaultAvatar.png';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  ProfileButton,
  UserAvatar,
  Content,
  ProviderListContainer,
  ProviderList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAccountButton,
  CreateAccountButtonText,
} from './styles';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

interface RouteParams {
  providerId: string;
}

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute();
  const { goBack, navigate } = useNavigation();
  const routeParams = route.params as RouteParams;

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId,
  );

  useEffect(() => {
    api.get('providers').then((response) => {
      setProviders(response.data);
    });
  }, []);

  useEffect(() => {
    api
      .get(`providers/${selectedProvider}/day-availability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then((response) => {
        setAvailability(response.data);
      });
  }, [selectedDate, selectedProvider]);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectedProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker((state) => !state);
  }, []);

  const handleDateChange = useCallback((event: any, date: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  const handleSelectHour = useCallback(
    (hour: number) => {
      setSelectedHour(hour);
    },
    [setSelectedHour],
  );

  const navigateToProfile = useCallback(() => {
    navigate('Profile');
  }, [navigate]);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);

      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: selectedProvider,
        date,
      });
      navigate('AppointmentCreated', { date: date.getTime() });
    } catch (err) {
      Alert.alert(
        'Erro ao criar o agentamento',
        'Ocorreu um erro ao criar o agendamento, tente novamente',
      );
    }
  }, [selectedProvider, navigate, selectedHour, selectedDate]);

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigateBack()}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>
        <HeaderTitle> Cabeleireiros </HeaderTitle>
        <ProfileButton onPress={navigateToProfile}  >
          <UserAvatar source={user.avatar_url ? { uri: user.avatar_url} : defaultAvatar } />
        </ProfileButton>
      </Header>
      <Content>
        <ProviderListContainer>
          <ProviderList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={providers}
            keyExtractor={(provider) => provider.id}
            renderItem={({ item: provider }) => (
              <ProviderContainer
                onPress={() => handleSelectedProvider(provider.id)}
                selected={provider.id === selectedProvider}
              >
                <ProviderAvatar source={provider.avatar_url ?{ uri: provider.avatar_url} : defaultAvatar } />
                <ProviderName selected={provider.id === selectedProvider}>
                  {provider.name}
                </ProviderName>
              </ProviderContainer>
            )}
          />
        </ProviderListContainer>

        <Calendar>
          <Title>Escolha uma data</Title>
          <OpenDatePickerButton onPress={handleToggleDatePicker}>
            <OpenDatePickerButtonText>
              Selecionar outra Data
            </OpenDatePickerButtonText>
          </OpenDatePickerButton>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              onChange={handleDateChange}
              display="calendar"
              value={selectedDate}
            />
          )}
        </Calendar>

        <Schedule>
          <Title> Escolha o Horário </Title>
          <Section>
            <SectionTitle> Manhã </SectionTitle>
            <SectionContent horizontal>
              {morningAvailability.map(({ hour, hourFormatted, available }) => (
                <Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  onPress={() => handleSelectHour(hour)}
                  available={available}
                  key={hourFormatted}
                >
                  <HourText
                    available={available}
                    selected={selectedHour === hour}
                  >
                    {hourFormatted}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>
          <Section>
            <SectionTitle> Tarde </SectionTitle>
            <SectionContent horizontal>
              {afternoonAvailability.map(
                ({ hour, hourFormatted, available }) => (
                  <Hour
                    enabled={available}
                    selected={selectedHour === hour}
                    onPress={() => handleSelectHour(hour)}
                    available={available}
                    key={hourFormatted}
                  >
                    <HourText
                      available={available}
                      selected={selectedHour === hour}
                    >
                      {hourFormatted}
                    </HourText>
                  </Hour>
                ),
              )}
            </SectionContent>
          </Section>
        </Schedule>
        <CreateAccountButton onPress={handleCreateAppointment}>
          <CreateAccountButtonText> Agendar </CreateAccountButtonText>
        </CreateAccountButton>
      </Content>
    </Container>
  );
};

export default CreateAppointment;
