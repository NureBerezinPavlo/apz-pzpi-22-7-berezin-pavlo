package com.example.elevator_monitoring

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
fun ElevatorDetailScreen(
    elevatorId: Int,
    authRepo: TechnicianAuthRepository,
    techniciansApi: TechniciansApi
) {
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var elevatorDetails by remember { mutableStateOf<TechniciansApi.ElevatorDetailsResponse?>(null) }
    var telemetry by remember { mutableStateOf<TechniciansApi.TelemetryResponse?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var comment by remember { mutableStateOf("") }
    var selectedStatus by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    val statusOptions = listOf("active", "maintenance", "broken")

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val detailsResponse = techniciansApi.getElevatorDetails(token, elevatorId)
                val telemetryResponse = techniciansApi.getLatestTelemetry(token, elevatorId)

                if (detailsResponse.isSuccessful && telemetryResponse.isSuccessful) {
                    elevatorDetails = detailsResponse.body()
                    telemetry = telemetryResponse.body()
                    selectedStatus = elevatorDetails?.status ?: ""
                } else {
                    error = "Не вдалося завантажити дані"
                }
            } catch (e: Exception) {
                error = "Помилка мережі: ${e.message}"
            } finally {
                isLoading = false
            }
        }
    }

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
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

            elevatorDetails?.let { details ->
                Text(
                    text = "Ліфт #${details.id}",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Text(text = "Серійний номер: ${details.serial_number}")
                Text(text = "Статус: ${formatStatus(details.status)}")
                Text(text = "Дата встановлення: ${details.install_date}")

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Телеметрія",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                telemetry?.let { t ->
                    Column {
                        Text(text = "Температура: ${t.temperature}°C")
                        Text(text = "Вологість: ${t.humidity}%")
                        Text(text = "Вага: ${t.weight} кг")
                        Text(text = "Живлення: ${if (t.is_power_on) "Увімкнено" else "Вимкнено"}")
                        Text(text = "Рух: ${if (t.is_moving) "Так" else "Ні"}")
                        Text(text = "Статус: ${if (t.is_stuck) "Застряг" else "Норма"}")
                        Text(text = "Останнє оновлення: ${t.timestamp}")
                    }
                } ?: Text("Дані телеметрії відсутні")

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Історія ремонтів",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                val history = details.repair_history.orEmpty()

                if (history.isEmpty()) {
                    Text("Історія ремонтів відсутня")
                } else {
                    Column {
                        history.forEach { repair ->
                            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                                Text(text = "Дата: ${repair.date}")
                                Text(text = "Технік: ${repair.technician_name}")
                                Text(text = "Опис: ${repair.description}")
                                Divider(modifier = Modifier.padding(vertical = 8.dp))
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Оновити статус",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Column(modifier = Modifier.fillMaxWidth()) {
                    statusOptions.forEach { status ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            Text(text = formatStatus(status))
                            RadioButton(
                                selected = selectedStatus == status,
                                onClick = { selectedStatus = status }
                            )
                        }
                    }
                }

                Button(
                    onClick = {
                        scope.launch {
                            try {
                                if (token != null && selectedStatus.isNotEmpty()) {
                                    techniciansApi.updateElevatorStatus(
                                        token,
                                        elevatorId,
                                        TechniciansApi.UpdateStatusRequest(selectedStatus)
                                    )
                                    // Оновити локальні дані
                                    elevatorDetails = elevatorDetails?.copy(status = selectedStatus)
                                }
                            } catch (e: Exception) {
                                // Обробка помилок
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Оновити статус")
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Додати коментар до ремонту",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                OutlinedTextField(
                    value = comment,
                    onValueChange = { comment = it },
                    label = { Text("Коментар") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Button(
                    onClick = {
                        scope.launch {
                            try {
                                if (token != null && comment.isNotEmpty()) {
                                    techniciansApi.addRepairComment(
                                        token,
                                        TechniciansApi.AddCommentRequest(elevatorId, comment)
                                    )
                                    comment = ""
                                }
                            } catch (e: Exception) {
                                // Обробка помилок
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Додати коментар")
                }
            }
        }
    }
}

@Composable
fun formatStatus(status: String): String {
    return when (status) {
        "active" -> stringResource(R.string.status_active)
        "maintenance" -> stringResource(R.string.status_maintenance)
        "critical" -> stringResource(R.string.status_broken)
        else -> status
    }
}