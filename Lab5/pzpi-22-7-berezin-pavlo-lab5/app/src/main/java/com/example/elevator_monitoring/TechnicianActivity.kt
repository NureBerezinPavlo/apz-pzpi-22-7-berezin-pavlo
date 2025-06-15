package com.example.elevator_monitoring

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import com.example.elevator_monitoring.ui.theme.ElevatormonitoringTheme

class TechnicianActivity : ComponentActivity() {
    private lateinit var authRepo: TechnicianAuthRepository
    private lateinit var techniciansApi: TechniciansApi

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        authRepo = TechnicianAuthRepository(this)
        techniciansApi = NetworkModule.techniciansApi

        setContent {
            ElevatormonitoringTheme {
                val token by authRepo.tokenFlow.collectAsState(initial = null)

                if (token == null) {
                    TechnicianLoginScreen(
                        authRepo = authRepo,
                        techniciansApi = techniciansApi,
                        onSuccess = { /* Нічого не робимо - автоматично перейде */ }
                    )
                } else {
                    TechnicianHomeScreen(
                        authRepo = authRepo,
                        techniciansApi = techniciansApi,
                        onLogout = { finish() }
                    )
                }
            }
        }
    }
}