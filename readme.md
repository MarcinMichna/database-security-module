
<h1>
  Implementacja modułu bezpieczeństwa
dostępu do danych na poziomie encji w
zależności od przypisanej roli użytkownika.
</h1>

Moduł bezpieczeństwa ma za zadanie zabezpieczyć dostęp do danych w tabelach przed użytkownikami którzy nie mają uprawnień dostępu.
Aby przygotować moduł do działania wywołać trzeba metodę inicjalizującą,
która ustawi dane logowania do bazy danych.
Przy każdorazowej zmianie roli użytkownika wywołać trzeba metodę ustawiającą
aktualną rolę w module bezpieczeństwa. Po ustawieniu roli, za każdy razem,
gdy wywołane zostanie zapytanie do bazy danych, argumenty funkcji zostaną
przechwycone i zmodyfikowana zostanie treść zapytania tak, aby zwrócone
z bazy danych rekordy nie zawierały tych do których użytkownik nie ma
dostępu.
O uprawnieniach decyduje rola przypisana do użytkownika. Role mają strukturę drzewiastą, więc każda rola znajdująca się wyżej w hierarchii drzewa
posiada wszystkie uprawnienia roli swoich dzieci.
Informacje na temat dostępu użytkownika z daną rolą do encji w tabeli będą
przechowywane w liście ACL. Dodatkowo w osobnej tabeli ACL przetrzymywane będą informacje na temat uprawnień do dodawania rekordów do tabel
w zależności od roli.

Pełna dokumentacja [tutaj](Dokumentacja.pdf)
