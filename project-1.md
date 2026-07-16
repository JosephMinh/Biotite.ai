---
title: Custom RAG-Powered Chatbot
description: Implementation of an AI chatbot solution to provide relevant, data-driven responses to users.
---

# Custom RAG-Powered Chatbot

!!! abstract "Case Study Summary"
    
    **Impact Metrics**:
    
    - 100% accuracy on initial evaluation datasets
    - < 3 second response time for customer inquiries


## Challenge

I built this project because the traditional search feature in Gmail or Outlook accounts uses a simple keyword search. This project takes it a step further by using semantic search and also uses AI to handle the query. The result is essentially a chatbot that I can ask more complex questions about data in my inbox.

## My Approach

For this project, I used a google apps script to scrape my inbox data and compile it into a spreadsheet. Next, I used a hybrid chunker from the docling library to chunk the data. I used an embedding model from OpenAI to generate vector embeddings of the chunks. Then, I stored these chunks and respective embeddings in a Postgres database using pgvector. I then created a function that used a simple SQL script to perform a similarity search on the vector database with the query. Then, I created a prompt to handle a user query along with the similarity search results and synthesize an answer. In the prompt, I wrote instructions to reply with “Information not available.” if the results from the similarity search could not be used to answer the user’s question. This limits hallucinations and makes sure the user is not misled with false information.

## Results

- Response time under 3 seconds
- 100% accuracy on initial evaluation datasets
- Currently expanding knowledge base coverage

As a result, I now have the ability to ask questions about information in my inbox and get the answer. Below is a video demonstration where I walk you through the process.

## Future Additions

I plan to use the Nylas API to pull email data on a regular basis and update the data that is used by the Rag system on a regular basis, removing the manual process from the data extraction. I would also like to build a simple frontend that can be deployed in a local browser tab.

## Tech Stack

- OpenAI API
- Postgres vector database
- Docling Library
- Python backend services
- SQL
- Docker containerization


<div class="grid cards" style="margin-top: 3rem" markdown>

-   :material-coffee:{ .lg .middle } Let's have a virtual coffee together!

    ---
    
    Want to see if we're a match? Let's have a chat and find out. Schedule a free 30-minute strategy session to discuss your AI challenges and explore how we can work together.

    [Book Free Intro Call :material-arrow-top-right:](https://calendly.com/joesamara/introductory-call){ .md-button .md-button--primary }

</div>