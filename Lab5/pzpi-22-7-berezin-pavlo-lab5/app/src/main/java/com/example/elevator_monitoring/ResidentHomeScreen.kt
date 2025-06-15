package com.example.elevator_monitoring

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.RadioButton
import androidx.compose.ui.res.stringResource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResidentHomeScreen(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi,
    onLogout: suspend () -> Unit
) {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Моніторинг ліфтів") },
                actions = {
                    IconButton(onClick = {
                        navController.navigate("profile")
                    }) {
                        Icon(Icons.Default.Person, contentDescription = "Профіль")
                    }
                    IconButton(onClick = {
                        navController.navigate("history")
                    }) {
                        Icon(Icons.Default.DateRange, contentDescription = "Історія")
                    }
                    IconButton(onClick = {
                        navController.navigate("emergency")
                    }) {
                        Icon(Icons.Default.Warning, contentDescription = "Екстрений виклик")
                    }
                    TextButton(onClick = {
                        scope.launch { onLogout() }
                    }) {
                        Text("Вийти")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Головна") },
                    label = { Text("Головна") },
                    selected = navController.currentDestination?.route == "home",
                    onClick = { navController.navigate("home") }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.List, contentDescription = "Ліфти") },
                    label = { Text("Ліфти") },
                    selected = navController.currentDestination?.route == "elevators",
                    onClick = { navController.navigate("elevators") }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Notifications, contentDescription = "Сповіщення") },
                    label = { Text("Сповіщення") },
                    selected = navController.currentDestination?.route == "notifications",
                    onClick = { navController.navigate("notifications") }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("home") { HomeTab(authRepo, residentsApi) }
            composable("elevators") { ElevatorsTab(authRepo, residentsApi) }
            composable("notifications") { NotificationsTab(authRepo, residentsApi) }
            composable("profile") { ProfileTab(authRepo, residentsApi, onLogout) }
            composable("history") { HistoryTab(authRepo, residentsApi) }
            composable("emergency") { EmergencyTab(authRepo, residentsApi) }
        }
    }
}

@Composable
private fun HomeTab(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi
) {
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var profile by remember { mutableStateOf<ResidentsApi.ProfileResponse?>(null) }
    var elevators by remember { mutableStateOf<List<ResidentsApi.ElevatorResponse>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val profileResponse = residentsApi.getProfile(token)
                if (profileResponse.isSuccessful) {
                    profile = profileResponse.body()

                    profile?.let {
                        val elevatorsResponse = residentsApi.getElevators(token)
                        if (elevatorsResponse.isSuccessful) {
                            elevators = elevatorsResponse.body() ?: emptyList()
                        } else {
                            error = "Не вдалося завантажити ліфти"
                        }
                    }
                } else {
                    error = "Не вдалося завантажити профіль"
                }
            } catch (e: Exception) {
                error = "Помилка мережі: ${e.localizedMessage}"
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
                    text = "Ласкаво просимо, ${it.name}!",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                Text(
                    text = "Ваш будинок: #${it.building_id}",
                    style = MaterialTheme.typography.bodyLarge
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Стан ліфтів:",
                style = MaterialTheme.typography.titleMedium
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (elevators.isEmpty()) {
                Text("Немає доступних ліфтів")
            } else {
                val activeCount = elevators.count { it.status == "active" }
                val maintenanceCount = elevators.count { it.status == "maintenance" }
                val brokenCount = elevators.count { it.status == "critical" }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    StatusIndicator(
                        count = activeCount,
                        total = elevators.size,
                        label = "Працюють",
                        icon = Icons.Default.CheckCircle,
                        color = MaterialTheme.colorScheme.primary
                    )
                    StatusIndicator(
                        count = maintenanceCount,
                        total = elevators.size,
                        label = "На ремонті",
                        icon = Icons.Default.Build,
                        color = MaterialTheme.colorScheme.secondary
                    )
                    StatusIndicator(
                        count = brokenCount,
                        total = elevators.size,
                        label = "Не працюють",
                        icon = Icons.Default.Warning,
                        color = MaterialTheme.colorScheme.error
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Останні події:",
                    style = MaterialTheme.typography.titleMedium
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Тут можна додати список останніх подій
                // Наприклад, останні запити на ремонт або сповіщення
            }
        }
    }
}

@Composable
private fun StatusIndicator(
    count: Int,
    total: Int,
    label: String,
    icon: ImageVector,
    color: Color
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, contentDescription = label, tint = color)
        Text(text = "$count/$total", style = MaterialTheme.typography.bodyLarge)
        Text(text = label, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun ElevatorsTab(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi
) {
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var elevators by remember { mutableStateOf<List<ResidentsApi.ElevatorResponse>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val response = residentsApi.getElevators(token)
                if (response.isSuccessful) {
                    elevators = response.body() ?: emptyList()
                } else {
                    error = "Не вдалося завантажити ліфти"
                }
            } catch (e: Exception) {
                error = "Помилка мережі: ${e.localizedMessage}"
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

            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(elevators) { elevator ->
                    ElevatorCard(
                        elevator = elevator,
                        onCallTechnician = {
                            scope.launch {
                                try {
                                    val response = residentsApi.requestMaintenance(
                                        token ?: "",
                                        ResidentsApi.MaintenanceRequest(
                                            elevator_id = elevator.id,
                                            description = "Запит на обслуговування від мешканця"
                                        )
                                    )

                                    if (response.isSuccessful) {
                                        error = "Технік викликаний до ліфта #${elevator.id}"
                                    } else {
                                        error = "Не вдалося викликати техніка"
                                    }
                                } catch (e: Exception) {
                                    error = "Помилка: ${e.localizedMessage}"
                                }
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun NotificationsTab(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi
) {
    // Тут можна реалізувати список сповіщень
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Сповіщення будуть тут")
    }
}

@Composable
private fun ProfileTab(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi,
    onLogout: suspend () -> Unit
) {
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var profile by remember { mutableStateOf<ResidentsApi.ProfileResponse?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var editMode by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var confirmPassword by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val response = residentsApi.getProfile(token)
                if (response.isSuccessful) {
                    profile = response.body()
                    name = profile?.name ?: ""
                    email = profile?.email ?: ""
                } else {
                    error = "Не вдалося завантажити профіль"
                }
            } catch (e: Exception) {
                error = "Помилка мережі: ${e.localizedMessage}"
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

            if (editMode) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Ім'я") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Новий пароль") },
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    label = { Text("Підтвердіть пароль") },
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Button(onClick = { editMode = false }) {
                        Text("Скасувати")
                    }

                    Button(
                        onClick = {
                            if (password.isNotEmpty() && password != confirmPassword) {
                                error = "Паролі не співпадають"
                                return@Button
                            }

                            scope.launch {
                                try {
                                    val response = residentsApi.updateProfile(
                                        token ?: "",
                                        ResidentsApi.UpdateProfileRequest(
                                            name = name,
                                            email = email,
                                            password = if (password.isNotEmpty()) password else null
                                        )
                                    )

                                    if (response.isSuccessful) {
                                        profile = response.body()
                                        editMode = false
                                        error = null
                                    } else {
                                        error = "Не вдалося оновити профіль"
                                    }
                                } catch (e: Exception) {
                                    error = "Помилка: ${e.localizedMessage}"
                                }
                            }
                        }
                    ) {
                        Text("Зберегти")
                    }
                }
            } else {
                profile?.let {
                    Text(
                        text = "Ваш профіль",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    Text(text = "Ім'я: ${it.name}")
                    Text(text = "Email: ${it.email}")
                    Text(text = "Будинок: #${it.building_id}")

                    Spacer(modifier = Modifier.height(24.dp))

                    Button(
                        onClick = { editMode = true },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Редагувати профіль")
                    }
                }
            }
        }
    }
}

@Composable
private fun HistoryTab(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi
) {
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var history by remember { mutableStateOf<List<ResidentsApi.MaintenanceHistoryResponse>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val response = residentsApi.getMaintenanceHistory(token)
                if (response.isSuccessful) {
                    history = response.body() ?: emptyList()
                } else {
                    error = "Не вдалося завантажити історію"
                }
            } catch (e: Exception) {
                error = "Помилка мережі: ${e.localizedMessage}"
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

            if (history.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Історія порожня")
                }
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    items(history) { record ->
                        HistoryItem(record = record)
                    }
                }
            }
        }
    }
}

@Composable
private fun HistoryItem(record: ResidentsApi.MaintenanceHistoryResponse) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = "Ліфт #${record.elevator_id}", style = MaterialTheme.typography.bodyLarge)
            Text(text = record.date, style = MaterialTheme.typography.bodySmall)
            Text(text = record.description, modifier = Modifier.padding(top = 4.dp))
            Text(
                text = "Статус: ${record.status}",
                color = when (record.status.lowercase()) {
                    "completed" -> MaterialTheme.colorScheme.primary
                    "in_progress" -> MaterialTheme.colorScheme.secondary
                    "pending" -> MaterialTheme.colorScheme.error
                    else -> MaterialTheme.colorScheme.onSurface
                },
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}

@Composable
private fun EmergencyTab(
    authRepo: AuthRepository,
    residentsApi: ResidentsApi
) {
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var message by rememberSaveable { mutableStateOf("") }
    var selectedElevator by rememberSaveable { mutableStateOf<Int?>(null) }
    var elevators by remember { mutableStateOf<List<ResidentsApi.ElevatorResponse>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val response = residentsApi.getElevators(token)
                if (response.isSuccessful) {
                    elevators = response.body() ?: emptyList()
                } else {
                    error = "Не вдалося завантажити ліфти"
                }
            } catch (e: Exception) {
                error = "Помилка мережі: ${e.localizedMessage}"
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
            text = "Екстрений виклик",
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

            successMessage?.let {
                Text(
                    text = it,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(8.dp)
                )
            }

            Text(
                text = "Оберіть ліфт:",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            if (elevators.isEmpty()) {
                Text("Немає доступних ліфтів")
            } else {
                elevators.forEach { elevator ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(vertical = 4.dp)
                    ) {
                        RadioButton(
                            selected = selectedElevator == elevator.id,
                            onClick = { selectedElevator = elevator.id }
                        )
                        Text(
                            text = "Ліфт #${elevator.id} (${elevator.serial_number})",
                            modifier = Modifier.padding(start = 8.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = message,
                onValueChange = { message = it },
                label = { Text("Опишіть проблему") },
                modifier = Modifier.fillMaxWidth(),
                maxLines = 3
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    if (selectedElevator == null) {
                        error = "Оберіть ліфт"
                        return@Button
                    }

                    scope.launch {
                        try {
                            val response = residentsApi.emergencyCall(
                                token ?: "",
                                ResidentsApi.EmergencyRequest(
                                    elevator_id = selectedElevator!!,
                                    message = message.ifEmpty { "Екстрений виклик" }
                                )
                            )

                            if (response.isSuccessful) {
                                successMessage = "Екстрений виклик надіслано!"
                                error = null
                                message = ""
                            } else {
                                error = "Не вдалося надіслати виклик"
                                successMessage = null
                            }
                        } catch (e: Exception) {
                            error = "Помилка: ${e.localizedMessage}"
                            successMessage = null
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer,
                    contentColor = MaterialTheme.colorScheme.onErrorContainer
                )
            ) {
                Text("Надіслати екстрений виклик")
            }
        }
    }
}

@Composable
fun ElevatorCard(
    elevator: ResidentsApi.ElevatorResponse,
    onCallTechnician: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Ліфт #${elevator.id}",
                style = MaterialTheme.typography.headlineSmall
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(text = "Серійний номер: ${elevator.serial_number}")
            Text(
                text = "Статус: ${getStatusText(elevator.status)}",
                color = when (elevator.status) {
                    "active" -> MaterialTheme.colorScheme.primary
                    "maintenance" -> MaterialTheme.colorScheme.secondary
                    "broken" -> MaterialTheme.colorScheme.error
                    else -> MaterialTheme.colorScheme.onSurface
                }
            )

            elevator.install_date?.let {
                Text(text = "Дата встановлення: $it")
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onCallTechnician,
                enabled = elevator.status != "active",
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Викликати техніка")
            }
        }
    }
}

fun getStatusText(status: String): String {
    return when (status) {
        "active" -> "Працює"
        "maintenance" -> "На обслуговуванні"
        "broken" -> "Не працює"
        else -> status
    }
}