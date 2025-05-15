# Marketmind
Marketing strategy and post gen agent for small businesses <br>
This is an extention of my other repository Marketmind-PIDS (That one is sooo doomed, but has usefull notebooks and trials in it check its diffrent branches if you are intrested in how we did the whole process)<br>
# Usage <br>
1. add the followin folders in the root before running<br>
chroma_db: vector db to store data<br>
memory_db: vector db to store conversation in memory<br>
Data: contains the database (PDF files)<br>

2. make sure you have npm, and all the needed python librires (I will add a requirements.txt file soon)<br>
3. open two terminals and run the following commands:<br>
   a. First terminal (To run the FastAPI and the RAG agent): uvicorn api:app --reload --host 0.0.0.0 --port 8000<br>
   b. Second terminal (To run the ReactJs App): npm run dev<br>

! This is not the final version of the project, there is a lot to add, until then ... grind guys, bye! <br>
