# FLUTTER ESTRUCTURA - Arquitectura de Código Flutter EsSalud v1.0

## 1. Estructura de Carpetas

```
essalud_flutter/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── app.dart                       # Widget raíz MaterialApp
│   │   └── router.dart                    # GoRouter configuration
│   │
│   ├── core/
│   │   ├── constants/
│   │   │   ├── api_constants.dart         # URLs y endpoints base
│   │   │   ├── app_constants.dart         # Constantes generales
│   │   │   └── color_constants.dart       # Design tokens de color
│   │   │
│   │   ├── enums/
│   │   │   ├── procedure_status.dart      # Estados de trámite
│   │   │   ├── document_status.dart       # Estados de documento
│   │   │   └── user_role.dart             # Roles de usuario
│   │   │
│   │   ├── errors/
│   │   │   ├── app_exception.dart         # Excepciones base
│   │   │   ├── network_exception.dart     # Errores de red
│   │   │   └── server_exception.dart      # Errores HTTP
│   │   │
│   │   ├── extensions/
│   │   │   ├── context_extensions.dart     # BuildContext helpers
│   │   │   ├── datetime_extensions.dart    # DateTime formateo
│   │   │   └── string_extensions.dart      # Validaciones de string
│   │   │
│   │   ├── network/
│   │   │   ├── api_client.dart            # Dio singleton setup
│   │   │   └── interceptors/
│   │   │       ├── auth_interceptor.dart   # JWT injection
│   │   │       ├── error_interceptor.dart  # Error handling
│   │   │       ├── logging_interceptor.dart # Request/response log
│   │   │       └── retry_interceptor.dart   # Retry with backoff
│   │   │
│   │   ├── router/
│   │   │   ├── route_names.dart           # Constantes de rutas
│   │   │   └── route_guards.dart          # Auth guards
│   │   │
│   │   ├── storage/
│   │   │   ├── secure_storage.dart        # flutter_secure_storage
│   │   │   └── local_preferences.dart     # SharedPreferences
│   │   │
│   │   └── utils/
│   │       ├── validators.dart            # Form validators
│   │       ├── formatters.dart            # Date, number formats
│   │       └── debouncer.dart             # Search debounce
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── auth_remote_datasource.dart
│   │   │   │   │   └── auth_local_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── user_model.dart        # Freezed + JSON
│   │   │   │   │   ├── login_request.dart
│   │   │   │   │   ├── login_response.dart
│   │   │   │   │   └── register_request.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.dart              # Entity pura
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart   # Abstract interface
│   │   │   │   └── usecases/
│   │   │   │       ├── login_usecase.dart
│   │   │   │       ├── register_usecase.dart
│   │   │   │       ├── logout_usecase.dart
│   │   │   │       └── forgot_password_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   ├── auth_provider.dart     # StateNotifierProvider
│   │   │       │   └── auth_state.dart        # Freezed state
│   │   │       ├── pages/
│   │   │       │   ├── login_page.dart
│   │   │       │   ├── register_page.dart
│   │   │       │   └── forgot_password_page.dart
│   │   │       └── widgets/
│   │   │           ├── login_form.dart
│   │   │           └── password_field.dart
│   │   │
│   │   ├── chatbot/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── chatbot_remote_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── chat_message_model.dart
│   │   │   │   │   ├── chat_session_model.dart
│   │   │   │   │   ├── faq_model.dart
│   │   │   │   │   └── source_citation_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── chatbot_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── chat_message.dart
│   │   │   │   │   ├── chat_session.dart
│   │   │   │   │   └── source_citation.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── chatbot_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── send_message_usecase.dart
│   │   │   │       ├── get_history_usecase.dart
│   │   │   │       └── send_feedback_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   ├── chat_provider.dart
│   │   │       │   ├── chat_history_provider.dart
│   │   │       │   └── chat_state.dart
│   │   │       ├── pages/
│   │   │       │   ├── chat_page.dart
│   │   │       │   └── chat_history_page.dart
│   │   │       └── widgets/
│   │   │           ├── chat_bubble.dart
│   │   │           ├── chat_input.dart
│   │   │           ├── typing_indicator.dart
│   │   │           ├── source_citation_widget.dart
│   │   │           └── feedback_buttons.dart
│   │   │
│   │   ├── procedures/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── procedure_remote_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── procedure_model.dart
│   │   │   │   │   ├── procedure_type_model.dart
│   │   │   │   │   └── procedure_create_request.dart
│   │   │   │   └── repositories/
│   │   │   │       └── procedure_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── procedure.dart
│   │   │   │   │   └── procedure_type.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── procedure_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── get_procedures_usecase.dart
│   │   │   │       ├── create_procedure_usecase.dart
│   │   │   │       ├── submit_procedure_usecase.dart
│   │   │   │       └── subsanate_procedure_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   ├── procedure_list_provider.dart
│   │   │       │   ├── procedure_detail_provider.dart
│   │   │       │   └── procedure_create_provider.dart
│   │   │       ├── pages/
│   │   │       │   ├── procedure_list_page.dart
│   │   │       │   ├── procedure_detail_page.dart
│   │   │       │   ├── procedure_create_page.dart
│   │   │       │   └── procedure_subsanate_page.dart
│   │   │       └── widgets/
│   │   │           ├── procedure_card.dart
│   │   │           ├── procedure_timeline.dart
│   │   │           ├── procedure_status_badge.dart
│   │   │           └── step_indicator.dart
│   │   │
│   │   ├── documents/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── document_remote_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── document_model.dart
│   │   │   │   │   └── document_upload_response.dart
│   │   │   │   └── repositories/
│   │   │   │       └── document_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── document.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── document_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── upload_document_usecase.dart
│   │   │   │       └── download_document_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   ├── document_upload_provider.dart
│   │   │       │   └── document_preview_provider.dart
│   │   │       ├── pages/
│   │   │       │   └── document_upload_page.dart
│   │   │       └── widgets/
│   │   │           ├── document_picker.dart
│   │   │           ├── upload_progress.dart
│   │   │           └── document_preview.dart
│   │   │
│   │   ├── news/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── news_remote_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── news_model.dart
│   │   │   │   │   └── news_category_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── news_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── news_article.dart
│   │   │   │   │   └── news_category.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── news_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       └── get_news_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   ├── news_list_provider.dart
│   │   │       │   └── news_detail_provider.dart
│   │   │       ├── pages/
│   │   │       │   ├── news_list_page.dart
│   │   │       │   └── news_detail_page.dart
│   │   │       └── widgets/
│   │   │           ├── news_card.dart
│   │   │           └── news_category_chip.dart
│   │   │
│   │   └── profile/
│   │       ├── data/
│   │       │   ├── datasources/
│   │       │   │   └── profile_remote_datasource.dart
│   │       │   ├── models/
│   │       │   │   └── profile_update_request.dart
│   │       │   └── repositories/
│   │       │       └── profile_repository_impl.dart
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   └── profile.dart
│   │       │   ├── repositories/
│   │       │   │   └── profile_repository.dart
│   │       │   └── usecases/
│   │       │       ├── update_profile_usecase.dart
│   │       │       └── change_password_usecase.dart
│   │       └── presentation/
│   │           ├── providers/
│   │           │   └── profile_provider.dart
│   │           ├── pages/
│   │           │   ├── profile_page.dart
│   │           │   ├── change_password_page.dart
│   │           │   └── notification_preferences_page.dart
│   │           └── widgets/
│   │               └── profile_header.dart
│   │
│   └── shared/
│       ├── widgets/
│       │   ├── app_scaffold.dart            # Scaffold base con BottomNav
│       │   ├── loading_indicator.dart
│       │   ├── error_screen.dart
│       │   ├── empty_state.dart
│       │   ├── custom_app_bar.dart
│       │   ├── status_badge.dart
│       │   └── retry_button.dart
│       ├── theme/
│       │   ├── app_theme.dart               # ThemeData completo
│       │   └── text_styles.dart             # Estilos de texto
│       └── providers/
│           ├── app_state_provider.dart
│           └── connectivity_provider.dart
│
├── test/
│   ├── unit/
│   │   ├── features/auth/
│   │   ├── features/chatbot/
│   │   └── features/procedures/
│   ├── widget/
│   │   ├── auth/
│   │   ├── chatbot/
│   │   └── procedures/
│   └── integration/
├── assets/
│   ├── images/
│   ├── fonts/
│   └── lottie/                   # Animaciones
├── lib/
├── pubspec.yaml
└── analysis_options.yaml
```

---

## 2. Responsabilidad por Capa

### 2.1 Capa Data

| Componente | Responsabilidad |
|------------|-----------------|
| **DataSource** | Comunicación con API (HTTP), almacenamiento local, cache |
| **Model** | DTOs con Freezed: serialización JSON, `fromJson`/`toJson`, validación |
| **Repository Impl** | Implementación del contrato del dominio, orquesta DataSources |

### 2.2 Capa Domain

| Componente | Responsabilidad |
|------------|-----------------|
| **Entity** | Objeto puro de dominio sin dependencias externas |
| **Repository** | Interfaz abstracta del repositorio |
| **UseCase** | Caso de uso atómico: recibe input, llama al repositorio, retorna output |

### 2.3 Capa Presentation

| Componente | Responsabilidad |
|------------|-----------------|
| **Provider** | Riverpod StateNotifier: estado, lógica de UI, llama UseCases |
| **State** | Freezed sealed class: estados Loading, Loaded, Error |
| **Page** | Pantalla completa: composición de widgets, navegación |
| **Widget** | Componente reutilizable de UI |

---

## 3. Clases Principales por Feature

### 3.1 Auth — Clases Principales

```dart
// Models (Freezed)
@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required int id,
    required String dni,
    required String email,
    @Default('') String phone,
    required String fullName,
    required String role,
    @Default(true) bool isActive,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}

// Repository
abstract class AuthRepository {
  Future<Either<Failure, User>> login(String email, String password);
  Future<Either<Failure, User>> register(RegisterRequest request);
  Future<Either<Failure, void>> logout();
  Future<Either<Failure, void>> forgotPassword(String email);
  Future<Either<Failure, void>> resetPassword(String token, String newPassword);
  Future<Either<Failure, void>> refreshToken();
  Stream<User?> get currentUser;
}

// UseCase
class LoginUseCase {
  final AuthRepository repository;
  
  Future<Either<Failure, User>> call(LoginParams params) {
    return repository.login(params.email, params.password);
  }
}

// Provider
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() => const AuthState.initial();
  
  Future<void> login(String email, String password) async {
    state = const AuthState.loading();
    final result = await ref.read(loginUseCaseProvider)(LoginParams(email, password));
    state = result.fold(
      (failure) => AuthState.error(failure.message),
      (user) => AuthState.authenticated(user),
    );
  }
}

// State
@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated(User user) = _Authenticated;
  const factory AuthState.error(String message) = _Error;
}
```

### 3.2 Chatbot — Clases Principales

```dart
// Models
@freezed
class ChatMessageModel with _$ChatMessageModel {
  const factory ChatMessageModel({
    required int id,
    required int sessionId,
    required String role,        // user | assistant
    required String content,
    @Default([]) List<SourceCitationModel> sources,
    double? confidence,
    int? latencyMs,
    String? messageType,         // text | faq | rag
    DateTime? createdAt,
  }) = _ChatMessageModel;

  factory ChatMessageModel.fromJson(Map<String, dynamic> json) =>
      _$ChatMessageModelFromJson(json);
}

// UseCase
class SendMessageUseCase {
  final ChatbotRepository repository;
  
  Future<Either<Failure, ChatMessage>> call(int sessionId, String question) async {
    return repository.sendMessage(sessionId, question);
  }
}

// Provider
@riverpod
class ChatNotifier extends _$ChatNotifier {
  @override
  ChatState build() => const ChatState.initial();
  
  Future<void> sendMessage(int sessionId, String question) async {
    final previousMessages = state.messages;
    state = state.copyWith(
      messages: [...previousMessages, ChatMessage.user(question)],
      isTyping: true,
    );
    
    final result = await ref.read(sendMessageUseCaseProvider)(sessionId, question);
    
    result.fold(
      (failure) => state = state.copyWith(
        messages: [...state.messages, ChatMessage.error(failure.message)],
        isTyping: false,
      ),
      (response) => state = state.copyWith(
        messages: [...state.messages, ChatMessage.assistant(response)],
        isTyping: false,
      ),
    );
  }
}
```

### 3.3 Procedures — Clases Principales

```dart
// Models
@freezed
class ProcedureModel with _$ProcedureModel {
  const factory ProcedureModel({
    required int id,
    required int userId,
    required int procedureTypeId,
    required String status,        // BORRADOR, PENDIENTE, etc.
    @Default([]) List<DocumentModel> documents,
    @Default([]) List<ProcedureHistoryModel> history,
    String? currentAssignee,
    DateTime? submittedAt,
    DateTime? completedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _ProcedureModel;

  factory ProcedureModel.fromJson(Map<String, dynamic> json) =>
      _$ProcedureModelFromJson(json);
}

// UseCase
class GetProceduresUseCase {
  final ProcedureRepository repository;
  
  Future<Either<Failure, List<Procedure>>> call() {
    return repository.getMyProcedures();
  }
}

// Provider
@riverpod
class ProcedureListNotifier extends _$ProcedureListNotifier {
  @override
  ProcedureListState build() => const ProcedureListState.initial();
  
  Future<void> loadProcedures() async {
    state = const ProcedureListState.loading();
    final result = await ref.read(getProceduresUseCaseProvider)();
    state = result.fold(
      (failure) => ProcedureListState.error(failure.message),
      (procedures) => ProcedureListState.loaded(procedures),
    );
  }
}
```

---

## 4. Manejo de Errores — Either/Result Pattern

```dart
// core/errors/app_exception.dart
sealed class Failure {
  final String message;
  const Failure(this.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class ServerFailure extends Failure {
  final int statusCode;
  const ServerFailure(super.message, this.statusCode);
}

class AuthFailure extends Failure {
  const AuthFailure(super.message);
}

class ValidationFailure extends Failure {
  final Map<String, String> fieldErrors;
  const ValidationFailure(super.message, this.fieldErrors);
}

// Extension for Either
extension EitherX<L, R> on Either<L, R> {
  R getOrThrow() => fold((l) => throw l, (r) => r);
}
```

---

## 5. Providers de Riverpod

| Provider | Tipo | Feature | Propósito |
|----------|------|---------|-----------|
| `authNotifierProvider` | StateNotifierProvider | Auth | Estado de autenticación |
| `chatNotifierProvider` | StateNotifierProvider | Chatbot | Estado del chat activo |
| `chatHistoryProvider` | FutureProvider.family | Chatbot | Historial por sesión |
| `procedureListProvider` | StateNotifierProvider | Procedures | Lista de trámites |
| `procedureDetailProvider` | FutureProvider.family | Procedures | Detalle por ID |
| `procedureCreateProvider` | StateNotifierProvider | Procedures | Formulario creación |
| `newsListProvider` | StateNotifierProvider | News | Lista de noticias |
| `newsDetailProvider` | FutureProvider.family | News | Detalle noticia |
| `documentUploadProvider` | StateNotifierProvider | Documents | Estado de subida |
| `profileProvider` | StateNotifierProvider | Profile | Datos de perfil |

---

## 6. GoRouter Configuración

```dart
// app/router.dart
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);
  
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authState is Authenticated;
      final isAuthRoute = state.matchedLocation.startsWith('/login') || 
                          state.matchedLocation.startsWith('/register');
      
      if (!isLoggedIn && !isAuthRoute) return '/login';
      if (isLoggedIn && isAuthRoute) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashPage()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingPage()),
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterPage()),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordPage()),
      
      ShellRoute(
        builder: (_, __, child) => AppScaffold(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomePage()),
          GoRoute(path: '/chat', builder: (_, __) => const ChatPage()),
          GoRoute(path: '/chat/history', builder: (_, __) => const ChatHistoryPage()),
          GoRoute(path: '/procedures', builder: (_, __) => const ProcedureListPage()),
          GoRoute(path: '/procedures/create', builder: (_, __) => const ProcedureCreatePage()),
          GoRoute(path: '/procedures/:id', builder: (_, state) => ProcedureDetailPage(id: state.pathParameters['id']!)),
          GoRoute(path: '/procedures/:id/subsanate', builder: (_, state) => ProcedureSubsanatePage(id: state.pathParameters['id']!)),
          GoRoute(path: '/news', builder: (_, __) => const NewsListPage()),
          GoRoute(path: '/news/:id', builder: (_, state) => NewsDetailPage(id: state.pathParameters['id']!)),
          GoRoute(path: '/profile', builder: (_, __) => const ProfilePage()),
          GoRoute(path: '/profile/change-password', builder: (_, __) => const ChangePasswordPage()),
          GoRoute(path: '/profile/notifications', builder: (_, __) => const NotificationPreferencesPage()),
        ],
      ),
    ],
  );
});
```

---

## 7. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[15_FLUTTER_UIUX]] | Diseño de componentes y pantallas |
| [[18_OPENAPI_SWAGGER]] | APIs que consumen los DataSources |
| [[05_MICROSERVICIOS]] | Endpoints de cada servicio |
| [[essalud/app/08_HISTORIAS_USUARIO]] | Funcionalidades implementadas |

---

#flutter #estructura #arquitectura #riverpod #dart #essalud #v1.0
