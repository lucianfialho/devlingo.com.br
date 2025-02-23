"use client"
import React from 'react'
import { Button } from './ui/button'

function BackButton() {
  return (
    <Button
        className="mt-4 px-4 py-2 text-white rounded-lg"
        onClick={() => window.history.back()}>
        Voltar para pagina anterior
    </Button>
  )
}

export default BackButton