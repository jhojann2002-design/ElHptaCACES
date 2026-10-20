#!/bin/bash
# Script para iniciar el servidor local del Simulador CACES
PORT=8080
echo "=========================================================="
echo "   Iniciando Simulador CACES MedPrep en el puerto $PORT   "
echo "=========================================================="

# Obtener directorio del script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Abrir en el navegador predeterminado de macOS
sleep 1 && open "http://localhost:$PORT" &

# Servidor HTTP con Python 3 integrado
python3 -m http.server $PORT
