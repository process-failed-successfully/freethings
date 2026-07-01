package com.example.freethingsreader

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

@Serializable
data object Onboarding : NavKey

@Serializable
data object Library : NavKey

@Serializable
data class Reading(val bookId: String) : NavKey

@Serializable
data object Settings : NavKey
