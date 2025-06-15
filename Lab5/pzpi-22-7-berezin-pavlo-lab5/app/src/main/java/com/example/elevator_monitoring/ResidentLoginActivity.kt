package com.example.elevator_monitoring

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent

class ResidentLoginActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LoginScreen(
                authRepo = AuthRepository(this),
                residentsApi = NetworkModule.retrofit.create(ResidentsApi::class.java),
                onSuccess = {
                    // після успіху — повернутися у MainActivity
                    startActivity(Intent(this, MainActivity::class.java))
                    finish()
                }
            )
        }
    }
}
