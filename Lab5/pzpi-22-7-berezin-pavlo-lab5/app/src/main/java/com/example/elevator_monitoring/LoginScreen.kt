package com.example.elevator_monitoring

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import androidx.compose.ui.text.style.TextAlign

@Composable
fun LoginScreen(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi,
    onSuccess: () -> Unit
) {
    var isLoginMode by remember { mutableStateOf(true) }
    var isForgotPassword by remember { mutableStateOf(false) }

    if (isForgotPassword) {
        ForgotPasswordScreen(
            onBack = { isForgotPassword = false },
            residentsApi = residentsApi
        )
    } else if (isLoginMode) {
        LoginForm(
            authRepo = authRepo,
            residentsApi = residentsApi,
            onSuccess = onSuccess,
            onSwitchToRegister = { isLoginMode = false },
            onForgotPassword = { isForgotPassword = true }
        )
    } else {
        RegisterForm(
            authRepo = authRepo,
            residentsApi = residentsApi,
            onSuccess = onSuccess,
            onSwitchToLogin = { isLoginMode = true }
        )
    }
}

@Composable
private fun LoginForm(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi,
    onSuccess: () -> Unit,
    onSwitchToRegister: () -> Unit,
    onForgotPassword: () -> Unit
) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Увійти",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Пароль") },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = {
                error = null
                coroutineScope.launch {
                    try {
                        val resp = residentsApi.login(ResidentsApi.LoginRequest(email, password))
                        if (resp.isSuccessful) {
                            resp.body()?.let { body ->
                                authRepo.saveToken("Bearer ${body.access_token}")
                                onSuccess()
                            } ?: run { error = "Пуста відповідь від сервера" }
                        } else {
                            error = "Невірні дані або помилка сервера (${resp.code()})"
                        }
                    } catch (e: Exception) {
                        error = "Помилка мережі: ${e.localizedMessage}"
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Увійти")
        }

        Spacer(Modifier.height(8.dp))

        ClickableText(
            text = AnnotatedString("Забули пароль?"),
            onClick = { onForgotPassword() },
            style = MaterialTheme.typography.bodyMedium.copy(
                color = MaterialTheme.colorScheme.primary
            )
        )

        Spacer(Modifier.height(24.dp))

        Text(
            text = "Ще не зареєстровані?",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(bottom = 4.dp)
        )

        Button(
            onClick = onSwitchToRegister,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer,
                contentColor = MaterialTheme.colorScheme.onSecondaryContainer
            )
        ) {
            Text("Створити акаунт")
        }

        error?.let { msg ->
            Spacer(Modifier.height(12.dp))
            Text(
                text = msg,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun RegisterForm(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi,
    onSuccess: () -> Unit,
    onSwitchToLogin: () -> Unit
) {
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var buildingId by rememberSaveable { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Реєстрація",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Ім'я") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Пароль") },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(8.dp))

        OutlinedTextField(
            value = buildingId,
            onValueChange = { buildingId = it },
            label = { Text("ID будинку") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = {
                error = null
                successMessage = null
                coroutineScope.launch {
                    try {
                        val id = buildingId.toIntOrNull() ?: throw IllegalArgumentException("ID будинку має бути числом")
                        val resp = residentsApi.register(
                            ResidentsApi.RegisterRequest(name, email, password, id)
                        )
                        if (resp.isSuccessful) {
                            successMessage = "Реєстрація успішна! Тепер увійдіть."
                        } else {
                            error = "Помилка реєстрації (${resp.code()})"
                        }
                    } catch (e: NumberFormatException) {
                        error = "ID будинку має бути числом"
                    } catch (e: Exception) {
                        error = "Помилка: ${e.localizedMessage}"
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Зареєструватися")
        }

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = onSwitchToLogin,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer,
                contentColor = MaterialTheme.colorScheme.onSecondaryContainer
            )
        ) {
            Text("Вже маєте акаунт? Увійти")
        }

        error?.let { msg ->
            Spacer(Modifier.height(12.dp))
            Text(
                text = msg,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }

        successMessage?.let { msg ->
            Spacer(Modifier.height(12.dp))
            Text(
                text = msg,
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun ForgotPasswordScreen(
    onBack: () -> Unit,
    residentsApi: ResidentsApi
) {
    var email by rememberSaveable { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Відновлення пароля",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Ваш email") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = {
                error = null
                successMessage = null
                coroutineScope.launch {
                    try {
                        val resp = residentsApi.resetPassword(
                            ResidentsApi.ResetPasswordRequest(email)
                        )
                        if (resp.isSuccessful) {
                            successMessage = "Інструкції для відновлення пароля відправлено на email"
                        } else {
                            error = "Помилка (${resp.code()})"
                        }
                    } catch (e: Exception) {
                        error = "Помилка мережі: ${e.localizedMessage}"
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Надіслати інструкції")
        }

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = onBack,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer,
                contentColor = MaterialTheme.colorScheme.onSecondaryContainer
            )
        ) {
            Text("Назад до входу")
        }

        error?.let { msg ->
            Spacer(Modifier.height(12.dp))
            Text(
                text = msg,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }

        successMessage?.let { msg ->
            Spacer(Modifier.height(12.dp))
            Text(
                text = msg,
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}