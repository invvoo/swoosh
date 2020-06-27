package com.invvoo.swoosh.Controller

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import com.invvoo.swoosh.Model.Servicer
import com.invvoo.swoosh.R
import com.invvoo.swoosh.Utilities.EXTRA_SERVICER

import kotlinx.android.synthetic.main.activity_languages.*

class LanguagesActivity : BaseActivity() {

    lateinit var servicer : Servicer

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState?.putParcelable(EXTRA_SERVICER, servicer)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_languages)
        servicer = intent.getParcelableExtra(EXTRA_SERVICER)!!

        iNeedAText.text = "${servicer.service} \n for"

            }

    override fun onRestoreInstanceState(savedInstanceState: Bundle) {
        super.onRestoreInstanceState(savedInstanceState)
        if (savedInstanceState != null) {
            servicer = savedInstanceState.getParcelable(EXTRA_SERVICER)!!
        }
    }

        fun onFromSpanishClick(view: View) {
            fromEnglishBtn.isChecked = false
            toSpanishButton.isChecked = false
            servicer.fromLanguage = "Spanish"
        }

        fun onFromEnglishClick(view: View) {
            fromSpanishBtn.isChecked = false
            toEnglishButton.isChecked = false
            servicer.fromLanguage = "English"
        }

        fun onToEnglishClick(view: View) {
            toSpanishButton.isChecked = false
            fromEnglishBtn.isChecked = false
            servicer.toLanguage = "English"

        }

        fun onToSpanishClick(view: View) {
            toEnglishButton.isChecked = false
            fromSpanishBtn.isChecked = false
            servicer.toLanguage = "Spanish"
        }

        fun onLanguageBtnClicked(view: View) {
            if (servicer.toLanguage != "" && servicer.fromLanguage != ""){
                val finishActivity = Intent(this, FinishActivity::class.java)
                finishActivity.putExtra(EXTRA_SERVICER, servicer)
                startActivity(finishActivity)
            } else {
                Toast.makeText(this, "Please make all selections.", Toast.LENGTH_SHORT).show()
            }


        }


    }




