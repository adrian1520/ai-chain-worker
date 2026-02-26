# RAPORT  
## Dotyczy: Zmiana roli generatora na Advisory Architecture Classifier

---

## 1. Cel dokumentu

Celem niniejszego raportu jest określenie zmiany funkcji generatora z modelu wykonawczego (Execution Generator) na model doradczy klasyfikujący architekturę (Advisory Architecture Classifier) oraz zdefiniowanie zasad jego działania.

Generator nie powinien zwracać danych w formacie JSON jako domyślnego wyniku. Zamiast tego ma generować opisową analizę architektoniczną wraz ze szkicem warstw systemu.

---

## 2. Zmiana roli systemu

### Aktualna rola (do usunięcia)
- Execution Generator  
- Wymuszone zwracanie struktury JSON  
- Twardy kontrakt `output_schema.json`

### Nowa rola
- Advisory Architecture Classifier  
- Odpowiedzi wyłącznie w formie tekstowej analizy  
- Brak obowiązkowego kontraktu JSON  

---

## 3. Oczekiwany sposób działania

Dla przykładowego opisu projektu:

Arduino code + JSON dla LLM

System powinien generować odpowiedź w uporządkowanej strukturze tekstowej zawierającej poniższe sekcje:

---

### 3.1 Klasyfikacja poziomu

Poziom 2 – Custom GPT + Execution

Uzasadnienie:
Projekt generuje artefakty (kod oraz JSON), wymaga stałej struktury wyjścia, jednak nie wymaga backendu ani trwałej pamięci.

---

### 3.2 Tryb pracy

Execution Mode

Projekt nie ma charakteru doradczego operacyjnie — działa jako narzędzie generujące określoną strukturę.

---

### 3.3 Proponowany szkic architektury

System Prompt powinien zawierać:
- zasady generowania kodu Arduino,
- strukturę `setup()` i `loop()`,
- mapowanie parametrów użytkownika na zmienne,
- reguły spójności między kodem a JSON,
- zakaz generowania nieużywanego kodu.

Knowledge powinno zawierać:
- referencyjną strukturę programu Arduino,
- przykładowe definicje pinów,
- typowe ograniczenia sprzętowe,
- schemat JSON używany przez LLM.

JSON kontrakt (opcjonalny)
Jeśli wykorzystywany, powinien definiować:
- blok kodu,
- blok JSON,
- sekcję opisową (opcjonalnie).

W przypadku maksymalnego uproszczenia projektu:
Kontrakt JSON może zostać pominięty na rzecz stałej struktury odpowiedzi określonej w prompt.

---

### 3.4 Backend

Backend nie jest wymagany.

Projekt nie wymaga trwałej pamięci ani mechanizmu zapisu danych.

---

## 4. Wymagane zmiany w generatorze

Należy usunąć:
- wymuszanie zwracania JSON,
- twardy kontrakt `output_schema.json`.

Należy dodać do System Prompt następujące wytyczne:

Wynik ma być tekstową analizą architektury.  
Nie generować JSON klasyfikacyjnego.  
Odpowiedź musi zawierać:
1. Klasyfikację poziomu.
2. Uzasadnienie.
3. Tryb pracy.
4. Szkic zawartości warstw.
5. Informację o backendzie.

---

## 5. Różnica architektoniczna

Obecnie możliwe są dwa typy generatorów:

1. Generator techniczny (zwraca JSON).
2. Generator doradczy (zwraca analizę tekstową).

Docelowo należy zastosować wariant drugi.

---

## 6. Uzasadnienie wyboru modelu doradczego

Model doradczy jest właściwszy, ponieważ:
- architektura jest procesem analitycznym,
- JSON jest odpowiedni dla integracji narzędziowych,
- klasyfikator powinien wyjaśniać swoje decyzje.

---

## 7. Możliwe dalsze kroki

Możliwe kierunki rozwoju:
- przygotowanie finalnej wersji System Prompt dla „Advisory Architecture Classifier”,
- opracowanie wersji hybrydowej: analiza tekstowa + opcjonalny JSON generowany na żądanie.
