package com.example.freethingsreader

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.freethingsreader.data.DefaultDataRepository
import com.example.freethingsreader.ui.library.LibraryScreen
import com.example.freethingsreader.ui.onboarding.OnboardingScreen
import com.example.freethingsreader.ui.read.ReadingScreen
import com.example.freethingsreader.ui.settings.SettingsScreen

@Composable
fun MainNavigation() {
  val context = LocalContext.current
  val repository = remember { DefaultDataRepository(context) }
  val backStack = rememberNavBackStack(Onboarding)

  NavDisplay(
    backStack = backStack,
    onBack = { backStack.removeLastOrNull() },
    entryProvider =
      entryProvider {
        entry<Onboarding> {
          OnboardingScreen(
            onStartClick = { backStack.add(Library) },
            modifier = Modifier.fillMaxSize()
          )
        }
        entry<Library> {
          LibraryScreen(
            repository = repository,
            onBookClick = { bookId -> backStack.add(Reading(bookId)) },
            onSettingsClick = { backStack.add(Settings) },
            modifier = Modifier.fillMaxSize()
          )
        }
        entry<Reading> { key ->
          ReadingScreen(
            bookId = key.bookId,
            repository = repository,
            onBackClick = { backStack.removeLastOrNull() },
            modifier = Modifier.fillMaxSize()
          )
        }
        entry<Settings> {
          SettingsScreen(
            repository = repository,
            onBackClick = { backStack.removeLastOrNull() },
            modifier = Modifier.fillMaxSize()
          )
        }
      },
  )
}
