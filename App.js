import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';

const API_URL = 'https://b2fc0587-7024-4856-9bf3-f08877f30cca-00-36r0a7k305pk8.spock.replit.dev';

// Специализированные вопросы для инкассатора
const SPECIALIZED_QUESTIONS = [
  "Алгоритм при нападении",
  "Порядок действий при поломке автомобиля",
  "Процедура сдачи денег в банк",
  "Действия при подозрении на слежку",
  "Проверка оборудования перед выездом",
  "Взаимодействие с полицией",
  "Действия при угрозе оружием",
  "Маршрут и график движения"
];

// Критичные ключевые слова для инкассаторской деятельности
const CRITICAL_KEYWORDS = {
  'нападение': true,
  'оружие': true,
  'угроз': true,
  'опасность': true,
  'слежк': true,
  'поломк': true,
  'авария': true,
  'происшествие': true,
  'тревог': true,
  'критич': true,
  'срочн': true,
  'помощь': true,
  'полиция': true,
  'безопасность': true
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    }
  }, [isLoading]);

  // Определяем, является ли вопрос критическим для инкассатора
  const isCriticalQuestion = (question) => {
    const lowerQuestion = question.toLowerCase();
    for (const keyword of Object.keys(CRITICAL_KEYWORDS)) {
      if (lowerQuestion.includes(keyword)) {
        return true;
      }
    }
    return false;
  };

  // Улучшенная валидация ответов с учетом критичности
  const validateResponse = (text, userMessage = '') => {
    if (!text || text.length < 5) {
      return { isValid: false, reason: 'Слишком короткий ответ' };
    }

    // Для критических вопросов - более строгая проверка
    const isCritical = isCriticalQuestion(userMessage);
    
    // Проверяем наличие английских слов
    const englishWords = text.match(/\b[a-zA-Z]+\b/g) || [];
    if (englishWords.length > (isCritical ? 1 : 2)) {
      return { isValid: false, reason: 'Слишком много английских слов' };
    }

    // Проверяем соотношение русских символов
    const russianChars = text.match(/[а-яА-ЯёЁ]/g) || [];
    const totalLetters = text.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '').length;
    
    const minRussianRatio = isCritical ? 0.8 : 0.7;
    if (totalLetters > 0 && (russianChars.length / totalLetters) < minRussianRatio) {
      return { isValid: false, reason: 'Недостаточно русских символов' };
    }

    // Проверяем осмысленность
    const words = text.trim().split(/\s+/);
    const minWords = isCritical ? 4 : 2;
    if (words.length < minWords) {
      return { isValid: false, reason: 'Ответ не выглядит осмысленным' };
    }

    // Очищаем ответ
    let cleaned = text
      .replace(/\b[a-zA-Z]+\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return { isValid: true, cleanedText: cleaned };
  };

  // Специализированные ответы для критических ситуаций
  const getCriticalResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Критические алгоритмы действий
    if (message.includes('нападение') || message.includes('оружие') || message.includes('угроз')) {
      return `🚨 КРИТИЧЕСКАЯ СИТУАЦИЯ: НАПАДЕНИЕ

1. НЕМЕДЛЕННО активируйте тревожную кнопку
2. Сохраняйте спокойствие, не оказывайте сопротивления
3. Запомните приметы нападающих: рост, телосложение, одежда, особенности
4. По возможности зафиксируйте номера автомобилей, направление движения
5. После инцидента оставайтесь на месте до прибытия полиции
6. Сообщите в диспетчерскую службу и руководству

ВАЖНО: Ваша безопасность - приоритет номер один!`;
    }

    if (message.includes('поломк') || message.includes('авария') || message.includes('автомобил')) {
      return `🔧 АВАРИЙНАЯ СИТУАЦИЯ: ПОЛОМКА ТРАНСПОРТА

1. Остановитесь в безопасном месте, включите аварийную сигнализацию
2. Немедленно сообщите в диспетчерскую службу
3. Выставьте знак аварийной остановки
4. Не покидайте транспортное средство без необходимости
5. Дождитесь сопровождения или технической помощи
6. Сохраняйте бдительность - оставайтесь в салоне

Действуйте согласно инструкции по действиям в аварийных ситуациях`;
    }

    if (message.includes('слежк') || message.includes('подозрени')) {
      return `👀 СИТУАЦИЯ: ПОДОЗРЕНИЕ НА СЛЕЖКУ

1. Не паникуйте, продолжайте движение по маршруту
2. Проверьте - действительно ли вас преследуют (сделайте несколько беспричинных поворотов)
3. Немедленно сообщите в диспетчерскую службу
4. Не возвращайтесь в инкассаторское отделение
5. Следуйте к ближайшему отделению полиции или охраняемому объекту
6. При необходимости активируйте тревожную сигнализацию

Не предпринимайте резких маневров - это может спровоцировать нападение`;
    }

    if (message.includes('полиция') || message.includes('взаимодействие')) {
      return `👮 ВЗАИМОДЕЙСТВИЕ С ПОЛИЦИЕЙ

1. При контакте сохраняйте спокойствие и вежливость
2. Предъявите служебное удостоверение по требованию
3. Сообщите о характере выполняемой задачи
4. При задержании немедленно свяжитесь с руководством
5. Следуйте указаниям сотрудников полиции
6. Фиксируйте время и обстоятельства взаимодействия

Помните: сотрудничество с правоохранительными органами - ваша обязанность`;
    }

    // Общий критический ответ
    return `⚠️ КРИТИЧЕСКАЯ СИТУАЦИЯ

1. Немедленно сообщите в диспетчерскую службу
2. Сохраняйте спокойствие и действуйте по инструкции
3. Обеспечьте собственную безопасность
4. Зафиксируйте все обстоятельства происшествия
5. Дождитесь инструкций от руководства
6. Не принимайте самостоятельных решений, угрожающих безопасности

Ваши действия должны соответствовать утвержденным регламентам и инструкциям`;
  };

  const getFallbackResponse = (userMessage, reason = '') => {
    const message = userMessage.toLowerCase();
    
    console.log('Using fallback for:', userMessage, 'Reason:', reason);

    // Для критических вопросов - специализированные ответы
    if (isCriticalQuestion(userMessage)) {
      return getCriticalResponse(userMessage);
    }

    // Общие ответы
    if (message.includes('привет') || message.includes('здравств')) {
      return 'Привет! Я - оперативный помощник инкассатора. Готов помочь с алгоритмами действий в различных ситуациях.';
    }
    
    if (message.includes('процедура') || message.includes('сдача') || message.includes('банк')) {
      return `🏦 ПРОЦЕДУРА СДАЧИ ДЕНЕЖНЫХ СРЕДСТВ

1. Подготовьте сопроводительную документацию
2. Убедитесь в целостности упаковки и пломб
3. Согласуйте время прибытия с банком-получателем
4. Соблюдайте меры безопасности при перемещении ценностей
5. Получите подтверждающие документы о приеме
6. Сообщите в диспетчерскую о завершении операции

Все этапы должны фиксироваться в операционном журнале`;
    }

    if (message.includes('проверк') || message.includes('оборудован')) {
      return `🔍 ПРОВЕРКА ОБОРУДОВАНИЯ ПЕРЕД ВЫЕЗДОМ

1. Средства связи (рация, телефон)
2. Тревожная сигнализация
3. Видеорегистратор и камеры
4. Состояние транспортного средства
5. Средства индивидуальной защиты
6. Исправность оружия (при наличии)

Результаты проверки зафиксируйте в путевом листе`;
    }

    if (message.includes('маршрут') || message.includes('график')) {
      return `🗺️ ПЛАНИРОВАНИЕ МАРШРУТА

1. Согласуйте маршрут с диспетчерской службой
2. Избегайте постоянного использования одного маршрута
3. Учитывайте дорожную обстановку и время суток
4. Имейте запасные варианты движения
5. Сообщайте о всех отклонениях от маршрута
6. Соблюдайте установленные временные интервалы

Маршрут должен быть утвержден ответственным лицом`;
    }

    const fallbackResponses = [
      'Для уточнения алгоритма действий в вашей ситуации, пожалуйста, обратитесь к должностной инструкции или свяжитесь с диспетчерской службой.',
      'Оперативная ситуация требует точного соблюдения регламента. Рекомендую свериться с инструкцией по вашей конкретной задаче.',
      'Для решения вашего вопроса необходимо руководствоваться утвержденными процедурами и инструкциями по безопасности.',
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  };

  const sendMessage = async (customText = null, retryCount = 0) => {
    const textToSend = customText || inputText;
    
    if (!textToSend.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      // Специализированный промпт для инкассаторской деятельности
      const isCritical = isCriticalQuestion(textToSend);
      
      const specializedPrompt = `Ты - оперативный помощник для инкассаторов. ОТВЕЧАЙ СТРОГО НА РУССКОМ ЯЗЫКЕ.

КОНТЕКСТ: Инкассаторская деятельность, безопасность, алгоритмы действий в критических ситуациях.

ТРЕБОВАНИЯ:
1. Отвечай ТОЛЬКО на русском языке
2. Будь максимально конкретным и практичным
3. Используй нумерованные списки для алгоритмов
4. Давай четкие инструкции к действию
5. ${isCritical ? 'Это критическая ситуация - ответ должен быть предельно ясным и оперативным' : 'Ответ должен быть информативным и полезным'}
6. Не используй английские слова
7. Длина: ${isCritical ? '3-6 пунктов' : '2-4 предложения'}

ВОПРОС ИНКАССАТОРА: "${textToSend}"

ЧЕТКИЙ ОТВЕТ НА РУССКОМ:`;
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: specializedPrompt,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      let responseText = data.response || data.message || data.answer || '';
      
      console.log('Raw response:', responseText);
      
      // Валидируем ответ
      const validation = validateResponse(responseText, textToSend);
      
      let finalResponse;
      
      if (validation.isValid) {
        finalResponse = validation.cleanedText;
        console.log('Response is valid, using AI response');
      } else {
        console.log('Response invalid:', validation.reason);
        
        // Для критических вопросов не пытаемся повторно - сразу fallback
        if (isCritical || retryCount >= 1 || responseText.length < 10) {
          finalResponse = getFallbackResponse(textToSend, validation.reason);
        } else {
          console.log('Retrying with enhanced prompt...');
          return await sendMessage(customText, retryCount + 1);
        }
      }
      
      const aiMessage = {
        id: Date.now().toString() + '_ai',
        text: finalResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('API Error:', error);
      
      // В случае ошибки используем fallback
      const fallbackResponse = getFallbackResponse(textToSend, 'API error');
      
      const errorMessage = {
        id: Date.now().toString() + '_error',
        text: fallbackResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputText('');
    sendMessage(question);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'user' ? styles.userBubble : styles.aiBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userText : styles.aiText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
        <View style={styles.typingContainer}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
        <Text style={styles.typingText}>Разрабатываю алгоритм действий...</Text>
      </View>
    );
  };

  const clearChat = () => {
    Alert.alert(
      'Очистить чат',
      'Очистить историю оперативных переговоров?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Очистить', 
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setShowSuggestions(true);
            setInputText('');
          }
        },
      ]
    );
  };

  const showSuggestionsAgain = () => {
    setShowSuggestions(true);
  };

  const emergencyProtocol = () => {
    Alert.alert(
      '🚨 ЭКСТРЕННЫЙ ПРОТОКОЛ',
      'Активировать протокол экстренной ситуации?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Тревожная кнопка', 
          style: 'destructive',
          onPress: () => {
            handleQuickQuestion('Экстренная ситуация активация тревожной кнопки');
          }
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ Оперативный Помощник Инкассатора</Text>
        <Text style={styles.headerSubtitle}>Алгоритмы действий и безопасность</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.emergencyButton} onPress={emergencyProtocol}>
            <Text style={styles.emergencyButtonText}>🚨</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.suggestionsButton} onPress={showSuggestionsAgain}>
            <Text style={styles.suggestionsButtonText}>Алгоритмы</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Text style={styles.clearButtonText}>Очистить</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        ListFooterComponent={renderTypingIndicator}
        ListHeaderComponent={
          showSuggestions ? (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Оперативные сценарии:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
                {SPECIALIZED_QUESTIONS.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleQuickQuestion(question)}
                  >
                    <Text style={styles.suggestionText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.suggestionsHint}>
                Для экстренной ситуации нажмите 🚨 в верхнем правом углу
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Оперативный помощник</Text>
            <Text style={styles.emptyStateText}>
              Выберите сценарий из списка или опишите ситуацию
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Опишите ситуацию или задайте вопрос..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!isLoading}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
          ]} 
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.sendButtonText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🛡️ Боевой режим | Специализированные алгоритмы для инкассаторов
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1e' },
  header: {
    backgroundColor: '#2c2c2e', 
    paddingTop: 60, 
    paddingBottom: 20, 
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0, 
    borderBottomRightRadius: 0,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 6,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#fff', 
    textAlign: 'center' 
  },
  headerSubtitle: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.7)', 
    textAlign: 'center', 
    marginTop: 4 
  },
  headerButtons: {
    position: 'absolute',
    top: 40,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  emergencyButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  suggestionsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  suggestionsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  messagesList: { flex: 1 },
  messagesContainer: { padding: 16, paddingBottom: 8 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  suggestionsContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  suggestionsHint: {
    fontSize: 12,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  suggestionsScroll: {
    flexGrow: 0,
  },
  suggestionChip: {
    backgroundColor: '#3a3a3c',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#48484a',
  },
  suggestionText: {
    fontSize: 14,
    color: '#fff',
  },
  messageBubble: {
    maxWidth: '90%', 
    padding: 12, 
    borderRadius: 12, 
    marginVertical: 4,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 2, 
    elevation: 2,
  },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#007AFF', 
    borderBottomRightRadius: 4 
  },
  aiBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#2c2c2e', 
    borderBottomLeftRadius: 4, 
    borderWidth: 1, 
    borderColor: '#3a3a3c' 
  },
  typingBubble: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  messageText: { 
    fontSize: 16, 
    lineHeight: 20,
    color: '#fff'
  },
  userText: { 
    color: 'white' 
  },
  aiText: { 
    color: '#fff' 
  },
  timestamp: { 
    fontSize: 11, 
    color: '#8e8e93', 
    marginTop: 4, 
    alignSelf: 'flex-end' 
  },
  typingContainer: { 
    flexDirection: 'row', 
    marginRight: 8 
  },
  typingDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#8e8e93', 
    marginHorizontal: 2 
  },
  typingText: { 
    fontSize: 14, 
    color: '#8e8e93', 
    fontStyle: 'italic' 
  },
  inputContainer: {
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: '#2c2c2e', 
    alignItems: 'flex-end',
    borderTopWidth: 1, 
    borderTopColor: '#3a3a3c',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 6,
  },
  textInput: {
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#3a3a3c', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    marginRight: 12, 
    maxHeight: 100, 
    backgroundColor: '#1c1c1e', 
    fontSize: 16,
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#007AFF', 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#007AFF', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    elevation: 3,
  },
  sendButtonDisabled: { 
    backgroundColor: '#3a3a3c', 
    shadowOpacity: 0 
  },
  sendButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  footer: {
    padding: 8,
    backgroundColor: '#2c2c2e',
    borderTopWidth: 1,
    borderTopColor: '#3a3a3c',
  },
  footerText: {
    fontSize: 10,
    color: '#8e8e93',
    textAlign: 'center',
  },
});