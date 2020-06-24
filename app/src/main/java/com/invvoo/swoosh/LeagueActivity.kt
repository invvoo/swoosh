package com.invvoo.swoosh

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Toast
import kotlinx.android.synthetic.main.activity_league.*

class LeagueActivity : BaseActivity() {

    var selectedService = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_league)
    }

    fun onTranslatorClicked(view: View){
        interpreterButton.isChecked = false
        bothButton.isChecked = false
        selectedService = "translator"
    }

    fun onInterpreterClicked(view: View){
        translatorButton.isChecked = false
        bothButton.isChecked = false
        selectedService = "interpreter"
    }

    fun onBothClicked(view: View){
        translatorButton.isChecked = false
        interpreterButton.isChecked = false
        selectedService = "both at the same time"
    }

    fun leagueNextClicked(view: View) {
        if (selectedService != "") {
            val languageActivity = Intent(this, Languages::class.java)
            languageActivity.putExtra(EXTRA_LANGUAGE, selectedService)
            startActivity(languageActivity)
        } else {
            Toast.makeText(this, "Please select a service.", Toast.LENGTH_SHORT).show()
        }
    }


    //vendor application button
    fun applyVendorClicked(view: View) {
        val skillActivity = Intent(this, SkillActivity::class.java)
        startActivity(skillActivity)
    }


}