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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import kotlinx.coroutines.launch

@Composable
fun MapScreen(
    authRepo: TechnicianAuthRepository,
    techniciansApi: TechniciansApi,
    navController: NavHostController
) {
    val token = authRepo.tokenFlow.collectAsState(initial = null).value
    var elevators by remember { mutableStateOf<List<TechniciansApi.ElevatorStatusResponse>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LaunchedEffect(token) {
        if (token != null) {
            try {
                val response = techniciansApi.getProblemElevators(token)
                if (response.isSuccessful) {
                    elevators = response.body() ?: emptyList()
                } else {
                    error = context.getString(R.string.failed_load_elevators)
                }
            } catch (e: Exception) {
                error = "${context.getString(R.string.network_error)}: ${e.message}"
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
            text = stringResource(R.string.problem_elevators),
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

            if (elevators.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(stringResource(R.string.no_problem_elevators))
                }
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    items(elevators) { elevator ->
                        ProblemElevatorItem(elevator, navController)
                    }
                }
            }
        }
    }
}

@Composable
fun ProblemElevatorItem(
    elevator: TechniciansApi.ElevatorStatusResponse,
    navController: NavHostController
) {
    val statusColor = when (elevator.status) {
        "critical" -> Color.Red
        "broken" -> Color.Red
        "maintenance" -> Color.Yellow
        else -> Color.Gray
    }

    Card(
        onClick = {
            navController.navigate("elevator/${elevator.id}")
        },
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = stringResource(R.string.priority),
                    tint = statusColor,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "${stringResource(R.string.elevator)} #${elevator.id}",
                    style = MaterialTheme.typography.titleMedium
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(text = "${stringResource(R.string.building)}: ${elevator.building_name}")
            Text(text = "${stringResource(R.string.address)}: ${elevator.address}")
            Text(text = "${stringResource(R.string.status)}: ${formatStatus(elevator.status)}")
            Text(text = "${stringResource(R.string.last_update)}: ${elevator.last_update}")

            if (elevator.assigned_technician.isNotEmpty()) {
                Text(text = "${stringResource(R.string.assigned_tech)}: ${elevator.assigned_technician}")
            }
        }
    }
}