package com.example.elevator_monitoring

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TechnicianHomeScreen(
    authRepo: TechnicianAuthRepository,
    techniciansApi: TechniciansApi,
    onLogout: suspend () -> Unit
) {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.technician_panel)) },
                actions = {
                    IconButton(onClick = { navController.navigate("profile") }) {
                        Icon(Icons.Default.Person, contentDescription = stringResource(R.string.profile))
                    }
                    IconButton(onClick = {
                        scope.launch { onLogout() }
                    }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = stringResource(R.string.logout))
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.List, contentDescription = stringResource(R.string.tasks)) },
                    label = { Text(stringResource(R.string.tasks)) },
                    selected = navController.currentDestination?.route == "tasks",
                    onClick = { navController.navigate("tasks") }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Place, contentDescription = stringResource(R.string.elevators)) },
                    label = { Text(stringResource(R.string.elevators)) },
                    selected = navController.currentDestination?.route == "map",
                    onClick = { navController.navigate("map") }
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.DateRange, contentDescription = stringResource(R.string.history)) },
                    label = { Text(stringResource(R.string.history)) },
                    selected = navController.currentDestination?.route == "history",
                    onClick = { navController.navigate("history") }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "tasks",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("tasks") { TasksScreen(authRepo, techniciansApi, navController) }
            composable("map") { MapScreen(authRepo, techniciansApi, navController) }
            composable("history") { HistoryScreen(authRepo, techniciansApi) }
            composable("profile") {
                ProfileScreen(authRepo, techniciansApi, onLogout)
            }
            composable("elevator/{elevatorId}") { backStackEntry ->
                val elevatorId = backStackEntry.arguments?.getString("elevatorId")?.toIntOrNull()
                if (elevatorId != null) {
                    ElevatorDetailScreen(elevatorId, authRepo, techniciansApi)
                }
            }
        }
    }
}