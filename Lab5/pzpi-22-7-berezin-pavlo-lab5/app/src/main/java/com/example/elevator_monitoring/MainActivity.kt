package com.example.elevator_monitoring

import android.os.Bundle
import android.content.Intent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import com.example.elevator_monitoring.ui.theme.ElevatormonitoringTheme

class MainActivity : ComponentActivity() {
    private lateinit var authRepo: AuthRepository
    private lateinit var technicianAuthRepo: TechnicianAuthRepository
    private lateinit var residentsApi: ResidentsApi
    private lateinit var techniciansApi: TechniciansApi

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        authRepo = AuthRepository(this)
        technicianAuthRepo = TechnicianAuthRepository(this)
        residentsApi = NetworkModule.retrofit.create(ResidentsApi::class.java)
        techniciansApi = NetworkModule.techniciansApi

        setContent {
            ElevatormonitoringTheme {
                val residentToken by authRepo.tokenFlow.collectAsState(initial = null)
                val technicianToken by technicianAuthRepo.tokenFlow.collectAsState(initial = null)

                if (residentToken != null) {
                    ResidentHomeScreen(
                        authRepo = authRepo,
                        residentsApi = residentsApi,
                        onLogout = {
                            lifecycleScope.launch {
                                authRepo.clearToken()
                                recreate()
                            }
                        }
                    )
                } else if (technicianToken != null) {
                    TechnicianHomeScreen(
                        authRepo = technicianAuthRepo,
                        techniciansApi = techniciansApi,
                        onLogout = {
                            lifecycleScope.launch {
                                technicianAuthRepo.clearToken()
                                val intent = Intent(this@MainActivity, MainActivity::class.java)
                                startActivity(intent)
                                finish()
                            }
                        }
                    )
                } else {
                    UserTypeSelectionScreen(
                        onResidentSelected = {
                            val intent = Intent(this@MainActivity, ResidentLoginActivity::class.java)
                            startActivity(intent)
                            finish()
                        },
                        onTechnicianSelected = {
                            val intent = Intent(this@MainActivity, TechnicianActivity::class.java)
                            startActivity(intent)
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun UserTypeSelectionScreen(
    onResidentSelected: () -> Unit,
    onTechnicianSelected: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Оберіть тип акаунта",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        Button(
            onClick = onResidentSelected,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
        ) {
            Text("Я мешканець")
        }

        Button(
            onClick = onTechnicianSelected,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
        ) {
            Text("Я технік")
        }
    }
}
