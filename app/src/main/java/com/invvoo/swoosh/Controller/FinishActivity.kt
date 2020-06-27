package com.invvoo.swoosh.Controller

import android.annotation.SuppressLint
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.invvoo.swoosh.Model.Servicer
import com.invvoo.swoosh.R
import com.invvoo.swoosh.Utilities.EXTRA_SERVICER
import kotlinx.android.synthetic.main.activity_finish.*

class FinishActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_finish)

        val servicer = intent.getParcelableExtra<Servicer>(EXTRA_SERVICER)


        if (servicer != null) {
            searchServicesText.text = "Looking for a ${servicer.fromLanguage} to ${servicer.toLanguage} ${servicer.service} available now..."
        }

    }
}