package com.invvoo.swoosh.Model

import android.os.Parcel
import android.os.Parcelable

class Servicer(var service: String?, var fromLanguage: String?, var toLanguage: String?) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readString(),
        parcel.readString(),
        parcel.readString()
    ) {
    }

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(service)
        parcel.writeString(fromLanguage)
        parcel.writeString(toLanguage)
    }

    override fun describeContents(): Int {
        return 0
    }

    companion object CREATOR : Parcelable.Creator<Servicer> {
        override fun createFromParcel(parcel: Parcel): Servicer {
            return Servicer(parcel)
        }

        override fun newArray(size: Int): Array<Servicer?> {
            return arrayOfNulls(size)
        }
    }

}