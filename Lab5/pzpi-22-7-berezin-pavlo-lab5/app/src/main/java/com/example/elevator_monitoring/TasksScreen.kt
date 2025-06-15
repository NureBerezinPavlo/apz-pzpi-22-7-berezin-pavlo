package com.example.elevator_monitoring

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.example.elevator_monitoring.NetworkModule.techniciansApi
import kotlinx.coroutines.launch

@Composable
fun TasksScreen(
    authRepo: TechnicianAuthRepository,
    techniciansApi: TechniciansApi,
    navController: NavHostController
) {
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var tasks by remember { mutableStateOf<List<TechniciansApi.TaskResponse>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val response = techniciansApi.getPendingTasks(token)
                if (response.isSuccessful) {
                    tasks = response.body() ?: emptyList()
                } else {
                    error = "Не вдалося завантажити завдання"
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
        Text(
            text = "Активні завдання",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(bottom = 16.dp)
        )

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

            if (tasks.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Немає активних завдань")
                }
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    items(tasks) { task ->
                        TaskItem(task, authRepo, techniciansApi, navController)
                    }
                }
            }
        }
    }
}

@Composable
fun TaskItem(
    task: TechniciansApi.TaskResponse,
    authRepo: TechnicianAuthRepository,
    techniciansApi: TechniciansApi,
    navController: NavHostController
) {
    val scope = rememberCoroutineScope()
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var showError by remember { mutableStateOf<String?>(null) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Пріоритет",
                    tint = when (task.priority) {
                        "high" -> Color.Red
                        "medium" -> Color.Yellow
                        else -> Color.Green
                    },
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Будинок: ${task.building_name}",
                    style = MaterialTheme.typography.titleMedium
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(text = "Адреса: ${task.address}")
            Text(text = "Опис: ${task.description}")
            Text(text = "Створено: ${task.created_at}")

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    scope.launch {
                        try {
                            if (token != null) {
                                val technicianId = getTechnicianIdFromToken(token)

                                // Виконуємо запит на призначення завдання
                                val response = techniciansApi.assignTask(
                                    token,
                                    task.id,
                                    TechniciansApi.AssignTaskRequest(technicianId)
                                )

                                if (response.isSuccessful) {
                                    navController.navigate("elevator/${task.elevator_id}")
                                } else {
                                    showError = "Не вдалося прийняти завдання: ${response.code()}"
                                }
                            }
                        } catch (e: Exception) {
                            showError = "Помилка: ${e.localizedMessage}"
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Прийняти завдання")
            }

            showError?.let { error ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

// TODO Допоміжна функція для отримання ID техніка з токена
private suspend fun getTechnicianIdFromToken(token: String): Int {
    // Виконуємо мережевий запит, дістаємо id з профілю
    val resp = techniciansApi.getProfile(token)
    if (resp.isSuccessful) {
        return resp.body()?.id
            ?: throw IllegalStateException("Profile body is null")
    } else {
        throw IllegalStateException("Cannot fetch profile: ${resp.code()}")
    }
}
