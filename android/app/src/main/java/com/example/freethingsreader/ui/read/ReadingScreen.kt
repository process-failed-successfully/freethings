package com.example.freethingsreader.ui.read

import android.graphics.BitmapFactory
import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.freethingsreader.data.Book
import com.example.freethingsreader.data.DataRepository
import com.example.freethingsreader.data.PhonicsEntry
import com.example.freethingsreader.theme.BackgroundCream
import com.example.freethingsreader.theme.CoralOrange
import com.example.freethingsreader.theme.MintGreen
import com.example.freethingsreader.theme.SkyBlue
import com.example.freethingsreader.theme.SoftYellow
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ReadingScreen(
    bookId: String,
    repository: DataRepository,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    val book = remember(bookId) {
        repository.books.find { it.id == bookId }
    }
    
    if (book == null) {
        Box(modifier = modifier, contentAlignment = Alignment.Center) {
            Text("Book not found")
        }
        return
    }

    var currentPageIndex by remember { mutableIntStateOf(0) }
    val page = book.pages[currentPageIndex]
    
    val audioPlayer = remember { AudioPlayer(context) }
    
    var isReadingAloud by remember { mutableStateOf(false) }
    var highlightedWordIndex by remember { mutableIntStateOf(-1) }
    var spokenWordIndex by remember { mutableIntStateOf(-1) }
    var readAloudJob by remember { mutableStateOf<Job?>(null) }

    // Click to phonics state
    var selectedWordForPhonics by remember { mutableStateOf<String?>(null) }
    var phonicsEntryForWord by remember { mutableStateOf<PhonicsEntry?>(null) }

    val words = remember(page.text) {
        page.text.split(" ")
    }

    // Stop audio on page change or screen exit
    fun stopAllAudio() {
        audioPlayer.stop()
        isReadingAloud = false
        highlightedWordIndex = -1
        spokenWordIndex = -1
        readAloudJob?.cancel()
        readAloudJob = null
    }

    LaunchedEffect(currentPageIndex) {
        stopAllAudio()
    }

    DisposableEffect(Unit) {
        onDispose {
            audioPlayer.stop()
            readAloudJob?.cancel()
        }
    }

    // Phonics clean word parser
    fun cleanWord(raw: String): String {
        return raw.lowercase().replace(Regex("[^a-z]"), "")
    }

    fun playWordAudio(wordStr: String, index: Int) {
        stopAllAudio()
        spokenWordIndex = index
        val cleaned = cleanWord(wordStr)
        
        // Play word audio
        audioPlayer.playAssetAudio("audio/$cleaned.wav") {
            spokenWordIndex = -1
        }

        // Setup phonics tooltip if enabled
        if (!repository.disablePhonicsTips) {
            val entry = repository.phonicsDictionary[cleaned]
            if (entry != null) {
                selectedWordForPhonics = wordStr
                phonicsEntryForWord = entry
            }
        }
    }

    fun startReadAloud() {
        stopAllAudio()
        val pageAudioPath = "audio/page_${book.id}_$currentPageIndex.wav"
        val duration = audioPlayer.getDuration(pageAudioPath)
        
        val safeDuration = if (duration > 0) duration else 3000
        val wordInterval = safeDuration / words.size

        isReadingAloud = true
        
        audioPlayer.playAssetAudio(pageAudioPath) {
            isReadingAloud = false
            highlightedWordIndex = -1
        }

        readAloudJob = scope.launch {
            for (i in words.indices) {
                highlightedWordIndex = i
                delay(wordInterval.toLong())
            }
            highlightedWordIndex = -1
        }
    }

    // Load page image from assets
    val pageBitmap = remember(page.image) {
        try {
            context.assets.open(page.image).use { inputStream ->
                BitmapFactory.decodeStream(inputStream)
            }
        } catch (e: Exception) {
            Log.e("ReadingScreen", "Failed to load page image ${page.image}", e)
            null
        }
    }

    // Gesture detection for horizontal swiping
    var totalSwipeDrag by remember { mutableStateOf(0f) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
            .pointerInput(currentPageIndex) {
                detectHorizontalDragGestures(
                    onDragStart = { totalSwipeDrag = 0f },
                    onDragEnd = {
                        if (totalSwipeDrag > 150f) {
                            if (currentPageIndex > 0) currentPageIndex--
                        } else if (totalSwipeDrag < -150f) {
                            if (currentPageIndex < book.pages.size - 1) currentPageIndex++
                        }
                    },
                    onHorizontalDrag = { change, dragAmount ->
                        change.consume()
                        totalSwipeDrag += dragAmount
                    }
                )
            }
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Cute Progress Bar
            val progress = (currentPageIndex + 1).toFloat() / book.pages.size
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .background(Color.LightGray.copy(alpha = 0.3f))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .fillMaxWidth(progress)
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(SkyBlue, MintGreen)
                            )
                        )
                )
            }

            // Top Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Back button (large target size)
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .background(MaterialTheme.colorScheme.surface, shape = CircleShape)
                        .clickable { onBackClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "🏡", fontSize = 24.sp)
                }

                // Title
                Text(
                    text = book.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onBackground,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f).padding(horizontal = 8.dp)
                )

                // Read Aloud button (only shown if not disabled by parents, large target size)
                if (!repository.disableReadAloud) {
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .background(
                                color = if (isReadingAloud) CoralOrange else SkyBlue,
                                shape = CircleShape
                            )
                            .clickable {
                                if (isReadingAloud) {
                                    stopAllAudio()
                                } else {
                                    startReadAloud()
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (isReadingAloud) "⏹️" else "🔊",
                            fontSize = 24.sp
                        )
                    }
                } else {
                    Spacer(modifier = Modifier.width(52.dp))
                }
            }

            // Main Content Area: Illustration and Text
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Book Illustration Card
                Card(
                    shape = RoundedCornerShape(24.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(260.dp)
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        if (pageBitmap != null) {
                            Image(
                                bitmap = pageBitmap.asImageBitmap(),
                                contentDescription = page.text,
                                contentScale = ContentScale.Fit,
                                modifier = Modifier.fillMaxSize().padding(8.dp)
                            )
                        } else {
                            Box(
                                modifier = Modifier.fillMaxSize().background(Color.LightGray),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("No Illustration")
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))

                // Words flow
                FlowRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp),
                    horizontalArrangement = Arrangement.Center,
                    maxItemsInEachRow = 8
                ) {
                    words.forEachIndexed { index, word ->
                        val isHighlighted = index == highlightedWordIndex
                        val isWordSpoken = index == spokenWordIndex
                        
                        Text(
                            text = word,
                            style = MaterialTheme.typography.bodyLarge.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 28.sp,
                                color = when {
                                    isHighlighted -> Color(0xFF1E272C)
                                    isWordSpoken -> Color(0xFF1E272C)
                                    else -> MaterialTheme.colorScheme.onBackground
                                }
                            ),
                            modifier = Modifier
                                .padding(horizontal = 6.dp, vertical = 4.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(
                                    color = when {
                                        isHighlighted -> CoralOrange
                                        isWordSpoken -> MintGreen
                                        else -> Color.Transparent
                                    }
                                )
                                .clickable {
                                    playWordAudio(word, index)
                                }
                                .padding(horizontal = 4.dp)
                        )
                    }
                }
            }

            // Bottom Navigation Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 20.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Prev button
                Button(
                    onClick = { if (currentPageIndex > 0) currentPageIndex-- },
                    enabled = currentPageIndex > 0,
                    colors = ButtonDefaults.buttonColors(containerColor = SkyBlue),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.height(48.dp)
                ) {
                    Text("⬅️ Prev", color = Color.White, fontWeight = FontWeight.Bold)
                }

                // Page Indicator
                Text(
                    text = "${currentPageIndex + 1} / ${book.pages.size}",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onBackground
                )

                // Next button
                Button(
                    onClick = {
                        if (currentPageIndex < book.pages.size - 1) {
                            currentPageIndex++
                        } else {
                            // Finished the book! Save progress and go back to library.
                            repository.markBookCompleted(book.id, true)
                            onBackClick()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SkyBlue),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.height(48.dp)
                ) {
                    Text(
                        text = if (currentPageIndex == book.pages.size - 1) "Finish 🎉" else "Next ➡️",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Syllable/Phonics Dialog Popup overlay
        val currentPhonicsWord = selectedWordForPhonics
        val currentPhonicsEntry = phonicsEntryForWord
        
        if (currentPhonicsWord != null && currentPhonicsEntry != null) {
            AlertDialog(
                onDismissRequest = {
                    selectedWordForPhonics = null
                    phonicsEntryForWord = null
                },
                shape = RoundedCornerShape(28.dp),
                title = {
                    Text(
                        text = "Phonics Helper ✨",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = CoralOrange,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                },
                text = {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        // Word Syllable Breakdown
                        val syllabled = currentPhonicsEntry.parts.joinToString(" • ")
                        Text(
                            text = syllabled,
                            style = MaterialTheme.typography.displayLarge.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 36.sp,
                                color = SkyBlue
                            ),
                            textAlign = TextAlign.Center
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Tip Explanation Box
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SoftYellow.copy(alpha = 0.2f), shape = RoundedCornerShape(16.dp))
                                .padding(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = currentPhonicsEntry.tip,
                                style = MaterialTheme.typography.bodyLarge.copy(
                                    fontSize = 18.sp,
                                    lineHeight = 24.sp
                                ),
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                        }
                    }
                },
                confirmButton = {
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        Button(
                            colors = ButtonDefaults.buttonColors(containerColor = MintGreen),
                            shape = RoundedCornerShape(16.dp),
                            onClick = {
                                selectedWordForPhonics = null
                                phonicsEntryForWord = null
                            }
                        ) {
                            Text("Got It! 👍", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            )
        }
    }
}
