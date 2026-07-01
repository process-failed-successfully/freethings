package com.example.freethingsreader.ui.read

import android.content.Context
import android.media.MediaPlayer
import android.util.Log

class AudioPlayer(private val context: Context) {
    private var mediaPlayer: MediaPlayer? = null

    fun playAssetAudio(assetPath: String, onCompletion: () -> Unit = {}) {
        stop()
        try {
            val afd = context.assets.openFd(assetPath)
            mediaPlayer = MediaPlayer().apply {
                setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                afd.close()
                prepare()
                setOnCompletionListener {
                    onCompletion()
                    stop()
                }
                start()
            }
        } catch (e: Exception) {
            Log.e("AudioPlayer", "Error playing audio $assetPath", e)
            onCompletion()
        }
    }

    fun getDuration(assetPath: String): Int {
        var duration = 0
        try {
            val afd = context.assets.openFd(assetPath)
            val mp = MediaPlayer().apply {
                setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                afd.close()
                prepare()
            }
            duration = mp.duration
            mp.release()
        } catch (e: Exception) {
            Log.e("AudioPlayer", "Error getting duration for $assetPath", e)
        }
        return duration
    }

    fun stop() {
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
        } catch (e: Exception) {
            Log.e("AudioPlayer", "Error stopping audio player", e)
        }
        mediaPlayer = null
    }
}
