package com.example.elevator_monitoring

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

// Локальний DTO для елементів історії ремонту

data class RepairHistoryItem(
    val id: Int,
    val date: String,
    val technician_name: String,
    val description: String
)

@Composable
fun HistoryScreen(
    authRepo: TechnicianAuthRepository,
    techniciansApi: TechniciansApi
) {
    val token by authRepo.tokenFlow.collectAsState(initial = null)
    var history by remember { mutableStateOf<List<RepairHistoryItem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(token) {
        val realToken = token
        if (realToken != null) {
            try {
                val response = techniciansApi.getHistory(realToken)
                if (response.isSuccessful) {
                    history = response.body()!!.map {
                        RepairHistoryItem(
                            id               = it.id,
                            date             = it.maintenance_date,
                            technician_name  = "",  // тут вже можна було б вказати своє ім’я з профілю
                            description      = it.description
                        )
                    }
                } else {
                    error = "Не вдалося завантажити історію"
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
            text = "Історія робіт",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
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
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Історія робіт порожня")
                }
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    items(history) { item ->
                        HistoryItem(item)
                    }
                }
            }
        }
    }
}

@Composable
fun HistoryItem(item: RepairHistoryItem) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = "Дата: ${item.date}", style = MaterialTheme.typography.bodyLarge)
            Text(text = "Технік: ${item.technician_name}")
            Text(text = "Опис: ${item.description}")
        }
    }
}