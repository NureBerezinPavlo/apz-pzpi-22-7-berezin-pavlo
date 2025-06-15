package com.example.elevator_monitoring

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    authRepo: TechnicianAuthRepository,
    techniciansApi: TechniciansApi,
    onLogout: suspend () -> Unit
) {
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var profile by remember { mutableStateOf<TechniciansApi.ProfileResponse?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val response = techniciansApi.getProfile(token)
                if (response.isSuccessful) {
                    profile = response.body()
                } else {
                    error = "Не вдалося завантажити профіль"
                }
            } catch (e: Exception) {
                error = "Помилка мережі: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    Column(
        modifier = Modifier
            .padding(16.dp)
            .fillMaxSize()
    ) {
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            error?.let {
                Text(
                    text = it,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(8.dp)
                )
            }

            profile?.let {
                Text(
                    text = "Ваш профіль",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                Text(text = "Ім'я: ${it.name}")
                Text(text = "Телефон: ${it.phone_number}")
                Text(text = "Email: ${it.email}")

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        scope.launch { onLogout() }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer,
                        contentColor = MaterialTheme.colorScheme.onErrorContainer
                    )
                ) {
                    Text("Вийти з акаунта")
                }
            }
        }
    }
}