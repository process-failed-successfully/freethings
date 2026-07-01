package com.example.freethingsreader.ui.library

import android.graphics.BitmapFactory
import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.freethingsreader.data.Book
import com.example.freethingsreader.data.DataRepository
import com.example.freethingsreader.theme.CoralOrange
import com.example.freethingsreader.theme.MintGreen
import com.example.freethingsreader.theme.SkyBlue
import com.example.freethingsreader.theme.SoftYellow
import kotlin.random.Random

@Composable
fun LibraryScreen(
    repository: DataRepository,
    onBookClick: (String) -> Unit,
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedLevel by remember { mutableStateOf("A") }
    var showParentGate by remember { mutableStateOf(false) }
    
    // Check locked level constraint from settings
    val lockedLevel = repository.lockedLevel
    val activeLevel = if (lockedLevel != "None") lockedLevel else selectedLevel

    // If level is locked, ensure the active level matches the locked level
    LaunchedEffect(lockedLevel) {
        if (lockedLevel != "None") {
            selectedLevel = lockedLevel
        }
    }

    val filteredBooks = remember(activeLevel, repository.books) {
        repository.books.filter { it.level == activeLevel }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Library 📚",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                )

                // Parent Settings button (styled as gear emoji or similar)
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(SkyBlue.copy(alpha = 0.15f), shape = RoundedCornerShape(12.dp))
                        .clickable { showParentGate = true },
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "⚙️", fontSize = 22.sp)
                }
            }

            // Level filters (only visible if level is not locked by parents)
            if (lockedLevel == "None") {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    val levels = listOf("A", "B", "C", "D")
                    levels.forEach { level ->
                        val isSelected = selectedLevel == level
                        val buttonColor = when (level) {
                            "A" -> SkyBlue
                            "B" -> CoralOrange
                            "C" -> MintGreen
                            else -> SoftYellow
                        }
                        
                        val borderModifier = if (isSelected) Modifier else Modifier.border(1.dp, buttonColor.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 4.dp)
                                .height(44.dp)
                                .then(borderModifier)
                                .background(
                                    color = if (isSelected) buttonColor else Color.Transparent,
                                    shape = RoundedCornerShape(14.dp)
                                )
                                .clickable { selectedLevel = level },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Level $level",
                                style = MaterialTheme.typography.labelLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) Color(0xFF1E272C) else MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                                )
                            )
                        }
                    }
                }
            } else {
                // Informative locked state indicator
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 6.dp)
                        .background(MintGreen.copy(alpha = 0.15f), shape = RoundedCornerShape(12.dp))
                        .padding(vertical = 8.dp, horizontal = 16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "🔒 App is locked to Level $lockedLevel by Parents",
                        color = MaterialTheme.colorScheme.onBackground,
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Books Grid
            if (filteredBooks.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No books available for this level yet.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                    )
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredBooks) { book ->
                        BookCard(
                            book = book,
                            isCompleted = repository.isBookCompleted(book.id),
                            onClick = { onBookClick(book.id) }
                        )
                    }
                }
            }
        }

        // Parent Gate verification dialog
        if (showParentGate) {
            ParentGateDialog(
                onDismiss = { showParentGate = false },
                onSuccess = {
                    showParentGate = false
                    onSettingsClick()
                }
            )
        }
    }
}

@Composable
fun BookCard(book: Book, isCompleted: Boolean, onClick: () -> Unit) {
    val context = LocalContext.current
    
    // Load bitmap image from assets
    val bitmap = remember(book.thumbnail) {
        try {
            context.assets.open(book.thumbnail).use { inputStream ->
                BitmapFactory.decodeStream(inputStream)
            }
        } catch (e: Exception) {
            Log.e("BookCard", "Failed to load thumbnail ${book.thumbnail}", e)
            null
        }
    }

    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            // Book cover image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color.LightGray)
            ) {
                if (bitmap != null) {
                    Image(
                        bitmap = bitmap.asImageBitmap(),
                        contentDescription = book.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                if (isCompleted) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(8.dp)
                            .background(MintGreen, shape = RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "Done 🎉",
                            color = Color.White,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Title
            Text(
                text = book.title,
                style = MaterialTheme.typography.bodyLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    lineHeight = 20.sp
                ),
                maxLines = 2,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Info (Level and Words count)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .background(SkyBlue.copy(alpha = 0.15f), shape = RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "Level ${book.level}",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2980B9),
                            fontSize = 13.sp
                        )
                    )
                }
                Text(
                    text = "${book.wordsCount} words",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                        fontSize = 13.sp
                    )
                )
            }
        }
    }
}

@Composable
fun ParentGateDialog(onDismiss: () -> Unit, onSuccess: () -> Unit) {
    var answerInput by remember { mutableStateOf("") }
    var showError by remember { mutableStateOf(false) }
    val num1 = remember { (1..10).random() }
    val num2 = remember { (1..10).random() }
    val correctAnswer = num1 + num2

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Parent Gate") },
        text = {
            Column {
                Text(
                    text = "Please solve this to continue:",
                    style = MaterialTheme.typography.bodyMedium
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                Text(
                    text = "$num1 + $num2 = ?",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 22.sp
                    ),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                OutlinedTextField(
                    value = answerInput,
                    onValueChange = {
                        answerInput = it
                        showError = false
                    },
                    label = { Text("Enter Answer") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                
                if (showError) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Incorrect answer. Please try again!",
                        color = Color.Red,
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                colors = ButtonDefaults.buttonColors(containerColor = CoralOrange),
                onClick = {
                    val parsedAnswer = answerInput.trim().toIntOrNull()
                    if (parsedAnswer == correctAnswer) {
                        onSuccess()
                    } else {
                        showError = true
                    }
                }
            ) {
                Text("Verify Answer", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss
            ) {
                Text("Cancel")
            }
        }
    )
}
