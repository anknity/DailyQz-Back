/**
 * Expanded Questions Data for Backend
 * Includes all categories: Web Dev (with subcategories), DSA (with subcategories),
 * Aptitude, NEET, AI, Data Science, Networking
 */

const questionsData = {
  // ==================== WEB DEVELOPMENT ====================
  "web-development": [
    // HTML/CSS Questions
    {
      "question": "What does HTML stand for?",
      "options": ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks Text Mark Language"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "html-css"
    },
    {
      "question": "Which CSS property is used to change the text color?",
      "options": ["color", "text-color", "font-color", "text-style"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "html-css"
    },
    {
      "question": "What does CSS stand for?",
      "options": ["Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "html-css"
    },
    {
      "question": "Which HTML tag is used to define an internal style sheet?",
      "options": ["<style>", "<css>", "<script>", "<link>"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "html-css"
    },
    {
      "question": "What does 'box-sizing: border-box' CSS property do?",
      "options": ["Includes padding and border in element's total width/height", "Creates a box around elements", "Adds a border to all boxes", "Centers the box"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "html-css"
    },
    {
      "question": "What is the CSS Flexbox property to center items horizontally?",
      "options": ["justify-content: center", "align-items: center", "text-align: center", "margin: auto"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "html-css"
    },
    {
      "question": "What is the difference between display: none and visibility: hidden?",
      "options": ["display: none removes from DOM flow, visibility: hidden keeps space", "They are identical", "visibility: hidden removes from DOM", "display: none keeps the space"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "html-css"
    },
    {
      "question": "What is CSS Grid?",
      "options": ["A 2D layout system for creating complex layouts", "A framework", "A preprocessor", "A JavaScript library"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "html-css"
    },
    {
      "question": "What is the specificity order in CSS?",
      "options": ["!important > inline > ID > class > element", "class > ID > element", "element > class > ID", "ID > !important > class"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "html-css"
    },
    
    // JavaScript Questions
    {
      "question": "What is the correct JavaScript syntax to change content of element with id='demo'?",
      "options": ["document.getElementById('demo').innerHTML = 'Hello'", "document.getElement('demo').innerHTML = 'Hello'", "#demo.innerHTML = 'Hello'", "document.getElementById(demo).innerHTML = 'Hello'"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "javascript"
    },
    {
      "question": "What is the purpose of 'use strict' directive in JavaScript?",
      "options": ["Enables strict mode for catching common coding mistakes", "Makes code run faster", "Enables new ES6 features", "Prevents variable hoisting"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "javascript"
    },
    {
      "question": "What is the difference between '==' and '===' in JavaScript?",
      "options": ["'===' checks value and type, '==' only checks value", "'==' is faster", "'===' allows type coercion", "They are the same"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "javascript"
    },
    {
      "question": "What is a closure in JavaScript?",
      "options": ["A function that has access to variables from its outer scope", "A way to close a browser window", "A method to end a loop", "A type of error handling"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "javascript"
    },
    {
      "question": "What is the output of typeof null in JavaScript?",
      "options": ["object", "null", "undefined", "boolean"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "javascript"
    },
    {
      "question": "What is event delegation in JavaScript?",
      "options": ["Attaching a single event listener to a parent element", "Creating multiple events", "Deleting events", "Stopping event propagation"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "javascript"
    },
    {
      "question": "What is the event loop in JavaScript?",
      "options": ["Mechanism that handles async operations in single-threaded environment", "A type of for loop", "A DOM event", "A debugging tool"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "javascript"
    },
    {
      "question": "What is hoisting in JavaScript?",
      "options": ["Moving declarations to the top of scope during compilation", "A sorting algorithm", "A design pattern", "An error type"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "javascript"
    },
    
    // React Questions
    {
      "question": "What is the Virtual DOM in React?",
      "options": ["A lightweight copy of the actual DOM for efficient updates", "A browser feature", "A CSS framework", "A database"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "react"
    },
    {
      "question": "What hook is used for side effects in React?",
      "options": ["useEffect", "useState", "useContext", "useReducer"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "react"
    },
    {
      "question": "What is JSX in React?",
      "options": ["A syntax extension that allows HTML in JavaScript", "A new JavaScript version", "A testing framework", "A state management library"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "react"
    },
    {
      "question": "What is the purpose of keys in React lists?",
      "options": ["Help React identify which items have changed, added, or removed", "Style the list items", "Sort the list", "Filter the list"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "react"
    },
    {
      "question": "What is the difference between state and props in React?",
      "options": ["State is internal and mutable, props are external and immutable", "They are the same", "Props are mutable", "State comes from parent"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "react"
    },
    {
      "question": "What is React.memo used for?",
      "options": ["Memoizing functional components to prevent unnecessary re-renders", "Creating memos in UI", "Memory management", "Data storage"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "react"
    },
    {
      "question": "What is the useCallback hook used for?",
      "options": ["Memoizing functions to prevent recreating on every render", "Creating callbacks", "Handling errors", "Managing state"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "react"
    },
    {
      "question": "What is the Context API in React?",
      "options": ["A way to pass data through component tree without props drilling", "A database", "A routing library", "A testing tool"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "react"
    },
    
    // Tailwind CSS Questions
    {
      "question": "What is Tailwind CSS?",
      "options": ["A utility-first CSS framework", "A JavaScript framework", "A backend framework", "A database"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "tailwind"
    },
    {
      "question": "Which Tailwind class is used for flexbox?",
      "options": ["flex", "display-flex", "d-flex", "flexbox"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "tailwind"
    },
    {
      "question": "How do you center items horizontally in Tailwind?",
      "options": ["justify-center", "items-center", "text-center", "mx-auto"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "tailwind"
    },
    {
      "question": "What does the 'sm:' prefix mean in Tailwind?",
      "options": ["Apply styles from small breakpoint (640px) and up", "Small text", "Small margin", "Small padding"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "tailwind"
    },
    {
      "question": "How do you apply dark mode styles in Tailwind?",
      "options": ["dark: prefix", "night:", "dm:", "darkmode:"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "tailwind"
    },
    {
      "question": "What is the purpose of @apply directive in Tailwind?",
      "options": ["Extract repeated utility patterns into custom CSS classes", "Import external CSS", "Define variables", "Create animations"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "tailwind"
    },
    {
      "question": "How do you customize Tailwind configuration?",
      "options": ["Edit tailwind.config.js file", "Use inline styles", "Edit package.json", "Use CSS variables only"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "tailwind"
    },
    {
      "question": "What does JIT mode in Tailwind provide?",
      "options": ["Just-In-Time compilation for faster builds and all variants", "JavaScript integration", "JSON integration", "Java integration"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "tailwind"
    }
  ],

  // ==================== DSA ====================
  "dsa": [
    // Arrays
    {
      "question": "What is an array?",
      "options": ["Collection of elements stored at contiguous memory locations", "A type of loop", "A function", "A database"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "arrays"
    },
    {
      "question": "What is the time complexity of accessing an element in an array by index?",
      "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "arrays"
    },
    {
      "question": "What is the two-pointer technique?",
      "options": ["Using two pointers to traverse array from different ends or speeds", "Using two arrays", "Doubling array size", "Creating two copies"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "arrays"
    },
    {
      "question": "What is the sliding window technique?",
      "options": ["Maintaining a subset of elements as window that slides through array", "Moving array elements", "Sorting technique", "Search algorithm"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "arrays"
    },
    {
      "question": "What is the Kadane's algorithm used for?",
      "options": ["Finding maximum subarray sum", "Sorting arrays", "Binary search", "String matching"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "arrays"
    },
    
    // Linked Lists
    {
      "question": "What is a linked list?",
      "options": ["Linear data structure where elements point to the next", "A type of array", "A database table", "A function"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "linked-lists"
    },
    {
      "question": "What is the time complexity of inserting at the beginning of a linked list?",
      "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "linked-lists"
    },
    {
      "question": "What is a doubly linked list?",
      "options": ["Linked list where each node has pointers to both next and previous nodes", "Two linked lists", "Linked list with double data", "Circular linked list"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "linked-lists"
    },
    {
      "question": "How do you detect a cycle in a linked list?",
      "options": ["Using Floyd's cycle detection (slow and fast pointers)", "Using recursion only", "Sorting the list", "Using a stack"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "linked-lists"
    },
    
    // Trees
    {
      "question": "What is a binary tree?",
      "options": ["A tree where each node has at most two children", "A tree with binary data", "A sorted array", "A graph"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "trees"
    },
    {
      "question": "What is a Binary Search Tree (BST)?",
      "options": ["Binary tree where left child < parent < right child", "Any binary tree", "A balanced tree", "A complete tree"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "trees"
    },
    {
      "question": "What is inorder traversal?",
      "options": ["Left -> Root -> Right", "Root -> Left -> Right", "Left -> Right -> Root", "Right -> Root -> Left"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "trees"
    },
    {
      "question": "What is the height of a balanced binary tree with n nodes?",
      "options": ["O(log n)", "O(n)", "O(1)", "O(n²)"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "trees"
    },
    {
      "question": "What is an AVL tree?",
      "options": ["A self-balancing BST where heights of subtrees differ by at most 1", "Any binary tree", "An unbalanced tree", "A tree with AVL nodes"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "trees"
    },
    {
      "question": "What is a red-black tree?",
      "options": ["A self-balancing binary search tree with color properties", "A tree with red and black nodes only", "An unbalanced tree", "A graph"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "trees"
    },
    
    // Graphs
    {
      "question": "What is a graph in data structures?",
      "options": ["A non-linear data structure with vertices and edges", "A type of chart", "A sorted array", "A tree only"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "graphs"
    },
    {
      "question": "What is BFS (Breadth-First Search)?",
      "options": ["Graph traversal exploring all neighbors before moving deeper", "Depth-first exploration", "Binary search", "Sorting algorithm"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "graphs"
    },
    {
      "question": "What is DFS (Depth-First Search)?",
      "options": ["Graph traversal exploring as deep as possible before backtracking", "Level-by-level exploration", "Binary search", "Sorting algorithm"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "graphs"
    },
    {
      "question": "What is Dijkstra's algorithm used for?",
      "options": ["Finding shortest path in weighted graphs with non-negative weights", "Sorting arrays", "Searching in trees", "String matching"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "graphs"
    },
    {
      "question": "What is topological sorting?",
      "options": ["Linear ordering of vertices in DAG where u comes before v if edge u->v exists", "Sorting by topology", "Geographic sorting", "Random ordering"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "graphs"
    },
    
    // Dynamic Programming
    {
      "question": "What is dynamic programming?",
      "options": ["Solving problems by breaking them into overlapping subproblems", "A programming language", "A type of loop", "A data structure"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "dynamic-programming"
    },
    {
      "question": "What is memoization?",
      "options": ["Storing results of expensive function calls to avoid recomputation", "A memory type", "A data structure", "A sorting technique"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "dynamic-programming"
    },
    {
      "question": "What is the difference between top-down and bottom-up DP?",
      "options": ["Top-down uses recursion+memoization, bottom-up uses iteration+tabulation", "They are the same", "Top-down is faster", "Bottom-up uses more memory"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "dynamic-programming"
    },
    {
      "question": "What is the 0/1 Knapsack problem?",
      "options": ["Maximize value with weight constraint where items can't be divided", "Sorting problem", "Graph problem", "String problem"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "dynamic-programming"
    },
    
    // Stacks and Queues
    {
      "question": "What is a stack?",
      "options": ["LIFO data structure - Last In First Out", "FIFO data structure", "A sorted array", "A tree"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "stacks-queues"
    },
    {
      "question": "What is a queue?",
      "options": ["FIFO data structure - First In First Out", "LIFO data structure", "A sorted array", "A tree"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "stacks-queues"
    },
    {
      "question": "What is a priority queue?",
      "options": ["A queue where elements are dequeued based on priority", "A sorted queue", "A stack", "A linked list"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "stacks-queues"
    },
    {
      "question": "What data structure is used to implement function call stack?",
      "options": ["Stack", "Queue", "Array", "Tree"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "stacks-queues"
    },
    
    // Sorting
    {
      "question": "What is the time complexity of Quick Sort in average case?",
      "options": ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "sorting"
    },
    {
      "question": "What is the time complexity of Merge Sort?",
      "options": ["O(n log n) always", "O(n²)", "O(n)", "O(log n)"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "sorting"
    },
    {
      "question": "Which sorting algorithm is stable?",
      "options": ["Merge Sort", "Quick Sort", "Heap Sort", "Selection Sort"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "sorting"
    },
    {
      "question": "What is the space complexity of Merge Sort?",
      "options": ["O(n)", "O(1)", "O(log n)", "O(n²)"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "sorting"
    },
    
    // Searching
    {
      "question": "What is the time complexity of binary search?",
      "options": ["O(log n)", "O(n)", "O(1)", "O(n²)"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "searching"
    },
    {
      "question": "What is the prerequisite for binary search?",
      "options": ["Array must be sorted", "Array must be unsorted", "Array must have unique elements", "Array must be of fixed size"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "searching"
    },
    {
      "question": "What is the time complexity of linear search?",
      "options": ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "searching"
    },
    
    // Recursion
    {
      "question": "What is recursion?",
      "options": ["A function calling itself to solve smaller instances of a problem", "A loop", "A data structure", "A sorting method"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "recursion"
    },
    {
      "question": "What is a base case in recursion?",
      "options": ["The condition that stops the recursion", "The first call", "The last call", "An error condition"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "recursion"
    },
    {
      "question": "What is tail recursion?",
      "options": ["Recursion where recursive call is the last operation", "Recursion at the end of function", "A type of loop", "Non-recursive function"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "recursion"
    }
  ],

  // ==================== APTITUDE ====================
  "aptitude": [
    // Quantitative
    {
      "question": "If a product is sold at 20% profit, what is the ratio of cost price to selling price?",
      "options": ["5:6", "4:5", "6:5", "5:4"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "quantitative"
    },
    {
      "question": "A train travels 300 km in 5 hours. What is its speed?",
      "options": ["60 km/h", "50 km/h", "70 km/h", "55 km/h"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "quantitative"
    },
    {
      "question": "If A can do a work in 10 days and B in 15 days, how many days will they take together?",
      "options": ["6 days", "5 days", "7 days", "8 days"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "quantitative"
    },
    {
      "question": "What is 25% of 80?",
      "options": ["20", "25", "15", "30"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "quantitative"
    },
    {
      "question": "The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls are there?",
      "options": ["20", "25", "15", "18"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "quantitative"
    },
    {
      "question": "A sum of money doubles in 8 years at simple interest. What is the rate of interest?",
      "options": ["12.5%", "10%", "15%", "8%"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "quantitative"
    },
    {
      "question": "If the compound interest on Rs. 1000 for 2 years at 10% is?",
      "options": ["Rs. 210", "Rs. 200", "Rs. 220", "Rs. 250"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "quantitative"
    },
    {
      "question": "Two pipes can fill a tank in 12 and 15 hours respectively. How long will both together take?",
      "options": ["6.67 hours", "7 hours", "8 hours", "6 hours"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "quantitative"
    },
    
    // Logical
    {
      "question": "Find the next number: 2, 6, 12, 20, 30, ?",
      "options": ["42", "40", "44", "38"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "logical"
    },
    {
      "question": "If APPLE is coded as ELPPA, how is MANGO coded?",
      "options": ["OGNAM", "MGANO", "OGANM", "NAMGO"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "logical"
    },
    {
      "question": "All cats are dogs. Some dogs are rats. Which conclusion is valid?",
      "options": ["Some cats may be rats", "All cats are rats", "No cat is a rat", "All dogs are cats"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "logical"
    },
    {
      "question": "A is B's sister. C is B's mother. D is C's father. How is A related to D?",
      "options": ["Granddaughter", "Daughter", "Grandmother", "Sister"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "logical"
    },
    {
      "question": "If 'COMPUTER' is written as 'RFUVQNPC', how is 'MEDICINE' written?",
      "options": ["EOJDJEFN", "FNDJDJEN", "EFOJDENF", "NFEJDNEF"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "logical"
    },
    {
      "question": "Find the odd one out: Apple, Mango, Potato, Orange",
      "options": ["Potato", "Apple", "Mango", "Orange"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "logical"
    },
    
    // Verbal
    {
      "question": "Choose the synonym of 'Abundant':",
      "options": ["Plentiful", "Scarce", "Rare", "Limited"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "verbal"
    },
    {
      "question": "Choose the antonym of 'Benevolent':",
      "options": ["Malevolent", "Kind", "Generous", "Helpful"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "verbal"
    },
    {
      "question": "Fill in the blank: She is ___ than her sister.",
      "options": ["taller", "tall", "tallest", "more tall"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "verbal"
    },
    {
      "question": "Choose the correctly spelled word:",
      "options": ["Accommodate", "Accomodate", "Acommodate", "Acomodate"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "verbal"
    },
    
    // Data Interpretation
    {
      "question": "If a pie chart shows 25% for category A, what angle does it represent?",
      "options": ["90 degrees", "45 degrees", "60 degrees", "120 degrees"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "data-interpretation"
    },
    {
      "question": "In a bar graph, if bar A is 40 and bar B is 60, what is the ratio A:B?",
      "options": ["2:3", "3:2", "1:2", "2:1"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "data-interpretation"
    },
    {
      "question": "If total is 500 and one section is 20%, what is that section's value?",
      "options": ["100", "50", "150", "200"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "data-interpretation"
    }
  ],

  // ==================== NEET ====================
  "neet": [
    // Physics
    {
      "question": "What is the SI unit of force?",
      "options": ["Newton", "Joule", "Watt", "Pascal"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "physics"
    },
    {
      "question": "According to Newton's second law, F = ?",
      "options": ["ma", "mv", "m/a", "a/m"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "physics"
    },
    {
      "question": "What is the speed of light in vacuum?",
      "options": ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "physics"
    },
    {
      "question": "What is the formula for kinetic energy?",
      "options": ["½mv²", "mgh", "mv", "ma"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "physics"
    },
    {
      "question": "What is the unit of electric current?",
      "options": ["Ampere", "Volt", "Ohm", "Watt"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "physics"
    },
    {
      "question": "What is Ohm's law?",
      "options": ["V = IR", "P = VI", "E = mc²", "F = ma"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "physics"
    },
    {
      "question": "The phenomenon of total internal reflection is used in:",
      "options": ["Optical fibers", "Mirrors", "Lenses", "Prisms only"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "physics"
    },
    {
      "question": "What is the dimensional formula of Planck's constant?",
      "options": ["ML²T⁻¹", "MLT⁻²", "ML²T⁻²", "M⁻¹L²T"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "physics"
    },
    {
      "question": "The current passing through the battery in the given circuit is:",
      "options": ["1.5 A", "2.0 A", "0.5 A", "2.5 A"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Equivalent resistance of the circuit is 10 Ω. Using Ohm's law, I = V/R = 5/10 = 0.5 A."
    },
    {
      "question": "The electric field in a plane electromagnetic wave is given by Ez = 60 cos (5x + 1.5 × 10⁹ t) V/m. The expression for the corresponding magnetic field is:",
      "options": ["By = 60 sin (5x + 1.5 × 10⁹ t) T", "By = 2 × 10⁻⁷ cos (5x + 1.5 × 10⁹ t) T", "Bx = 2 × 10⁻⁷ cos (5x + 1.5 × 10⁹ t) T", "Bz = 60 cos (5x + 1.5 × 10⁹ t) T"],
      "correctAnswer": 1,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "In an EM wave, E and B are in phase and perpendicular. B = E/c = 60 / (3×10⁸) = 2×10⁻⁷ T."
    },
    {
      "question": "A pipe open at both ends has a fundamental frequency f in air. If the pipe is dipped vertically in water to half its length, the new fundamental frequency becomes:",
      "options": ["2f", "f/2", "f", "3f/2"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "When half dipped, the pipe behaves like a closed pipe of length L/2, giving the same fundamental frequency."
    },
    {
      "question": "An electron moving perpendicular to a magnetic field does not deflect when an electric field is applied. The electric field must be:",
      "options": ["Parallel to magnetic field", "Perpendicular to magnetic field with magnitude 27×10⁴ V/m", "Perpendicular to magnetic field with magnitude 27×10² V/m", "Parallel with magnitude 27×10² V/m"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "For no deflection, eE = evB, giving E = 27×10² V/m."
    },
    {
      "question": "Four identical convex lenses are placed in contact. The equivalent power and magnification are:",
      "options": ["p/4 and m/4", "4p and 4m", "p/4 and 4m", "4p and m⁴"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Powers add linearly and magnifications multiply."
    },
    {
      "question": "Two circular coils with radii in ratio 1:2 carry same current. Ratio of magnetic moments is:",
      "options": ["4:1", "1:4", "1:2", "2:1"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Magnetic moment ∝ area ∝ r²."
    },
    {
      "question": "The current through branch CD in the given circuit is:",
      "options": ["3.0 A", "1.5 A", "2.0 A", "2.5 A"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Using junction rule, current through CD = 2 A."
    },
    {
      "question": "Two gases under equal pressure receive equal heat. Piston displacements are 16 cm and 9 cm. Ratio of piston radii rA/rB is:",
      "options": ["3/2", "4/3", "3/4", "2/3"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Work done equal: rA² dA = rB² dB."
    },
    {
      "question": "Two chambers with ideal gases are mixed. Final pressure is:",
      "options": ["1.8 atm", "1.3 atm", "1.6 atm", "1.4 atm"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Using PV conservation, P = 1.6 atm."
    },
    {
      "question": "The radius of Mars orbit is 4 times Mercury. Mercury year is:",
      "options": ["124 days", "88 days", "225 days", "172 days"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Using Kepler's third law."
    },
    {
      "question": "In an AC circuit, current and phase angle are:",
      "options": ["15.6 A, 45°", "7.8 A, 30°", "7.8 A, 45°", "15.6 A, 30°"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Impedance calculation gives 7.8 A and 45°."
    },
    {
      "question": "A wire cut into 8 equal parts is recombined. Net resistance is:",
      "options": ["R/8", "R/64", "R/32", "R/16"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Parallel then series combination gives R/16."
    },
    {
      "question": "The logic gate represented by the given circuit is:",
      "options": ["NOR", "AND", "NAND", "OR"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Boolean simplification gives NOR."
    },
    {
      "question": "Two charged spheres interact after contact with an uncharged sphere. New force is:",
      "options": ["3F/8", "3F/5", "2F/3", "2F"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Charge redistribution gives force = 3F/8."
    },
    {
      "question": "A Vernier calipers measures diameter with zero error. Correct diameter is:",
      "options": ["5.00 cm", "5.18 cm", "5.08 cm", "4.98 cm"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Corrected reading = 4.98 cm."
    },
    {
      "question": "In some appropriate units, time and position relation is t = x² + x. The acceleration of the particle is:",
      "options": ["2/(2x+1)", "(3/2)(x−2)", "−(3/2)/(2x+1)", "(3/2)/(x+1)"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Using v = dx/dt and a = v dv/dx gives acceleration = −(3/2)/(2x+1)."
    },
    {
      "question": "Which graph represents variation of photoelectric current with intensity of light?",
      "options": ["Graph A", "Graph B", "Graph C", "Graph D"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Photoelectric current is directly proportional to intensity."
    },
    {
      "question": "A particle moves under a constant force toward origin. Using Bohr model, radius and velocity depend on n as:",
      "options": ["r ∝ n^(4/3), v ∝ n^(−1/3)", "r ∝ n^(1/3), v ∝ n^(1/3)", "r ∝ n^(1/3), v ∝ n^(2/3)", "r ∝ n^(2/3), v ∝ n^(1/3)"],
      "correctAnswer": 3,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "From mv²/r = constant and mvr = nh/2π."
    },
    {
      "question": "A bob tied to a string becomes slack at some point. Ratio v/v0 at that point is:",
      "options": ["√(sinθ / (3sinθ − 2))", "sinθ", "1/(sinθ)", "cosθ"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "physics",
      "explanation": "Using centripetal force and energy conservation."
    },
    {
      "question": "In a full wave rectifier, at t = 15 ms which diode is forward biased?",
      "options": ["Both reverse biased", "D1 forward, D2 reverse", "D1 reverse, D2 forward", "Both forward"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "At 15 ms supply is in negative half cycle."
    },
    {
      "question": "A balloon deflates with radius decreasing from R to 0. Correct dimensional relation is:",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 3,
      "difficulty": "hard",
      "subcategory": "physics",
      "explanation": "Using dimensional analysis on surface tension, density and area."
    },
    {
      "question": "Magnification of a microscope with given focal lengths is:",
      "options": ["250", "100", "125", "150"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "m = (L/f_o)(D/f_e)."
    },
    {
      "question": "Two masses oscillate on springs with equal max speed. Ratio of amplitudes is:",
      "options": ["k1/k2", "k2/k1", "√(k1/k2)", "√(k2/k1)"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "v_max = Aω and ω = √(k/m)."
    },
    {
      "question": "Magnetic field due to displacement current is:",
      "options": ["Zero everywhere", "Only outside plates", "Only inside plates", "Non-zero everywhere"],
      "correctAnswer": 3,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Displacement current produces magnetic field everywhere."
    },
    {
      "question": "Change in potential energy of electric dipole rotated in field is:",
      "options": ["1.5 J", "0.8 J", "1.0 J", "1.2 J"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "ΔU = pE(cosθ1 − cosθ2)."
    },
    {
      "question": "Coefficient of kinetic friction on inclined plane is approximately:",
      "options": ["0.75", "0.25", "0.40", "0.5"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Derived from ratio of times."
    },
    {
      "question": "De-Broglie wavelength of electron in n=2 orbit is:",
      "options": ["2.67 nm", "0.067 nm", "0.67 nm", "1.67 nm"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "λ = 2πr/n."
    },
    {
      "question": "If Sun radius doubles, new period of rotation is:",
      "options": ["108 days", "100 days", "105 days", "115 days"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Using conservation of angular momentum."
    },
    {
      "question": "Percentage error in quantity P is:",
      "options": ["15%", "10%", "2%", "13%"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Errors add algebraically."
    },
    {
      "question": "Capacitance doubles with dielectric slabs. Value of K1 is:",
      "options": ["1.33", "2.66", "2.33", "1.60"],
      "correctAnswer": 1,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Using series dielectric formula."
    },
    {
      "question": "A ball of mass 0.5 kg is dropped from a height of 40 m and rebounds to 10 m. Impulse during collision is:",
      "options": ["84 Ns", "21 Ns", "7 Ns", "0"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Impulse = change in momentum = m(v2 − v1) = 21 Ns."
    },
    {
      "question": "Two cities are connected by buses every T minutes. Scooty rider meets buses every 30 min same direction, 10 min opposite. Find T.",
      "options": ["15 min", "9 min", "25 min", "10 min"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Relative velocity equations give T = 15 min."
    },
    {
      "question": "Mass of oxygen withdrawn from a cylinder is:",
      "options": ["0.156 kg", "0.125 kg", "0.144 kg", "0.116 kg"],
      "correctAnswer": 3,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Using PV = nRT before and after withdrawal."
    },
    {
      "question": "Potential difference VA − VB when current is changing is:",
      "options": ["10 V", "5 V", "6 V", "9 V"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Using self-inductance relation."
    },
    {
      "question": "As sand leaks from oscillating box, frequency and amplitude:",
      "options": ["ω increases, A decreases", "ω decreases, A increases", "Both increase", "Both constant"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Mass decreases so ω increases, equilibrium position shifts."
    },
    {
      "question": "Magnetic moment of electron in lowest quantized orbit is:",
      "options": ["2heB/πm", "he/πm", "2he/πm", "heB/πm"],
      "correctAnswer": 2,
      "difficulty": "hard",
      "subcategory": "physics",
      "explanation": "From quantized flux and current loop."
    },
    {
      "question": "Gravitational force at height R/3 above Earth surface is:",
      "options": ["36 N", "16 N", "27 N", "32 N"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "F ∝ 1/(R+h)²."
    },
    {
      "question": "Equation of liquid surface due to surface tension is:",
      "options": ["ρg(dy/dx)/S", "ρg(d²y/dx²)/S", "ρg y = S d²y/dx²", "ρg/S"],
      "correctAnswer": 2,
      "difficulty": "hard",
      "subcategory": "physics",
      "explanation": "From pressure difference and curvature."
    },
    {
      "question": "Intensity through polaroids at 22.5° is:",
      "options": ["I0/16", "I0/2", "I0/4", "I0/8"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Using Malus' law twice."
    },
    {
      "question": "Ratio of de Broglie wavelengths of photon and electron is:",
      "options": ["E/2mc", "2E/m", "cmE²", "2mc/E"],
      "correctAnswer": 3,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "λ_ph / λ_e = 2mc/E."
    },
    {
      "question": "At Brewster angle, reflected light is:",
      "options": ["Unpolarized", "Completely polarized", "Partially polarized", "Circularly polarized"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Brewster's law."
    },
    {
      "question": "Friction force on rod leaning against wall is:",
      "options": ["200√3 N", "100 N", "100√3 N", "200 N"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "From torque equilibrium."
    },
    {
      "question": "Ratio of junction temperatures in three rods is:",
      "options": ["5/4", "3/2", "4/3", "5/3"],
      "correctAnswer": 3,
      "difficulty": "medium",
      "subcategory": "physics",
      "explanation": "Using thermal resistance in series."
    },
    {
      "question": "Ratio of braking forces of two cars is:",
      "options": ["1/2", "3/2", "2/3", "1/3"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "physics",
      "explanation": "Work-energy theorem."
    },
    {
      "question": "Ratio of moment of inertia of cut sphere is:",
      "options": ["7/64", "7/8", "7/40", "7/57"],
      "correctAnswer": 3,
      "difficulty": "hard",
      "subcategory": "physics",
      "explanation": "Using parallel axis theorem."
    },
    
    // Chemistry - Organic
    {
      "question": "What is the IUPAC name of CH₃OH?",
      "options": ["Methanol", "Ethanol", "Propanol", "Butanol"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-organic"
    },
    {
      "question": "Which functional group is present in aldehydes?",
      "options": ["-CHO", "-COOH", "-OH", "-CO"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-organic"
    },
    {
      "question": "Markovnikov's rule is applicable to:",
      "options": ["Addition of HX to unsymmetrical alkenes", "Substitution reactions", "Elimination reactions", "Oxidation reactions"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "chemistry-organic"
    },
    {
      "question": "What is the hybridization of carbon in benzene?",
      "options": ["sp²", "sp³", "sp", "sp³d"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "chemistry-organic"
    },
    {
      "question": "Major product of the given organic reaction is:",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "chemistry-organic",
      "explanation": "Reaction proceeds via more stable carbocation."
    },
    {
      "question": "Which compound shows cis-trans isomerism?",
      "options": ["1,2-Dimethylcyclohexane", "Pent-1-ene", "2-Methylhex-2-ene", "1,1-Dimethylcyclopropane"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-organic",
      "explanation": "Ring structure allows cis-trans isomerism."
    },
    {
      "question": "Correct order of C–H bond dissociation energy is:",
      "options": ["II > III > I", "II > I > III", "I > II > III", "III > II > I"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-organic",
      "explanation": "Higher s-character gives stronger bond."
    },
    {
      "question": "The hybridisation of carbon in ethyne is:",
      "options": ["sp3", "sp2", "sp", "sp2d"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-organic",
      "explanation": "Ethyne has a triple bond, so carbon is sp hybridised."
    },
    {
      "question": "Which compound is aromatic?",
      "options": ["Cyclobutadiene", "Benzene", "Cyclohexane", "Ethene"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-organic",
      "explanation": "Benzene follows Huckel's rule."
    },
    {
      "question": "Which compound shows geometrical isomerism?",
      "options": ["But-1-ene", "But-2-ene", "Propene", "Ethene"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-organic",
      "explanation": "But-2-ene has restricted rotation."
    },
    {
      "question": "The IUPAC name of CH₃–CH(OH)–CH₃ is:",
      "options": ["Propan-1-ol", "Propan-2-ol", "Ethanol", "Methanol"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-organic",
      "explanation": "OH group on second carbon → propan-2-ol."
    },
    {
      "question": "Which functional group gives positive Tollens test?",
      "options": ["Ketone", "Alcohol", "Aldehyde", "Ester"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-organic",
      "explanation": "Aldehydes reduce Tollens reagent."
    },
    
    // Chemistry - Inorganic
    {
      "question": "What is the atomic number of Carbon?",
      "options": ["6", "8", "12", "14"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic"
    },
    {
      "question": "Which element has the highest electronegativity?",
      "options": ["Fluorine", "Oxygen", "Chlorine", "Nitrogen"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic"
    },
    {
      "question": "The geometry of SF₆ is:",
      "options": ["Octahedral", "Tetrahedral", "Square planar", "Trigonal bipyramidal"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "chemistry-inorganic"
    },
    {
      "question": "Which compound shows optical isomerism?",
      "options": ["[Co(en)₃]³⁺", "[Ni(CN)₄]²⁻", "[Cu(NH₃)₄]²⁺", "[Zn(NH₃)₄]²⁺"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "chemistry-inorganic"
    },
    {
      "question": "Oxidation states of K in KO₂, O in H₂O₂ and S in H₂SO₄ are:",
      "options": ["+4, −4, +6", "+1, −1, +6", "+2, −2, +6", "+1, −2, +4"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Standard oxidation rules."
    },
    {
      "question": "Complex with minimum conductance is:",
      "options": ["[Co(NH3)5Cl]Cl", "[Co(NH3)3Cl3]", "[Co(NH3)4Cl2]", "[Co(NH3)6]Cl3"],
      "correctAnswer": 1,
      "difficulty": "medium",
      "subcategory": "chemistry-inorganic",
      "explanation": "Neutral complex gives least ions."
    },
    {
      "question": "Compound which undergoes maximum hydrolysis is:",
      "options": ["NaCl", "AlCl3", "NH4Cl", "CH3COONa"],
      "correctAnswer": 1,
      "difficulty": "medium",
      "subcategory": "chemistry-inorganic",
      "explanation": "Al³⁺ has high charge density."
    },
    {
      "question": "Strongest reducing agent is:",
      "options": ["Na", "K", "Li", "Cs"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "chemistry-inorganic",
      "explanation": "Li has highest hydration enthalpy."
    },
    {
      "question": "The oxidation state of sulphur in Na2S2O3 is:",
      "options": ["+6", "+4", "+2", "Average +2"],
      "correctAnswer": 3,
      "difficulty": "medium",
      "subcategory": "chemistry-inorganic",
      "explanation": "Thiosulphate has two sulphur atoms with different oxidation states; average is +2."
    },
    {
      "question": "Which compound shows hydrogen bonding in liquid state?",
      "options": ["NH3", "PH3", "AsH3", "SbH3"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Hydrogen bonding occurs when H is bonded to N, O, or F."
    },
    {
      "question": "Which metal is extracted by electrolytic reduction?",
      "options": ["Fe", "Zn", "Al", "Cu"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Aluminium is extracted by electrolysis."
    },
    {
      "question": "The order of reactivity of halogens is:",
      "options": ["F > Cl > Br > I", "I > Br > Cl > F", "Cl > F > Br > I", "Br > Cl > I > F"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Reactivity decreases down the group."
    },
    {
      "question": "Which reaction is an example of redox reaction?",
      "options": ["NaCl + AgNO3", "Zn + CuSO4", "HCl + NaOH", "CaCO3 → CaO + CO2"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Zn is oxidised and Cu is reduced."
    },
    {
      "question": "The shape of SF6 molecule is:",
      "options": ["Tetrahedral", "Square planar", "Octahedral", "Trigonal bipyramidal"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "SF6 has six bonding pairs."
    },
    {
      "question": "Which is the strongest acid?",
      "options": ["HF", "HCl", "HBr", "HI"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Acid strength increases down the group."
    },
    {
      "question": "The coordination number of cobalt in [Co(NH3)6]Cl3 is:",
      "options": ["3", "4", "6", "2"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Six NH3 ligands are directly bonded to Co."
    },
    {
      "question": "Which metal forms amphoteric oxide?",
      "options": ["Na", "Al", "Ca", "K"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Al2O3 reacts with both acids and bases."
    },
    {
      "question": "Which gas causes brown ring test?",
      "options": ["NO", "NO2", "N2O", "NH3"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Nitric oxide forms brown ring complex."
    },
    {
      "question": "Which element has highest electronegativity?",
      "options": ["Oxygen", "Nitrogen", "Fluorine", "Chlorine"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-inorganic",
      "explanation": "Fluorine is the most electronegative element."
    },
    
    // Chemistry - Physical
    {
      "question": "What is the unit of rate constant for first order reaction?",
      "options": ["s⁻¹", "mol L⁻¹ s⁻¹", "L mol⁻¹ s⁻¹", "mol⁻¹ L s⁻¹"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "chemistry-physical"
    },
    {
      "question": "The value of gas constant R is:",
      "options": ["8.314 J mol⁻¹ K⁻¹", "8.314 kJ mol⁻¹ K⁻¹", "0.0821 J mol⁻¹ K⁻¹", "1.987 J mol⁻¹ K⁻¹"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "chemistry-physical"
    },
    {
      "question": "At equilibrium, the Gibbs free energy change (ΔG) is:",
      "options": ["Zero", "Positive", "Negative", "Infinity"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "chemistry-physical"
    },
    {
      "question": "If the molar conductivity of a 0.050 M solution of a monobasic weak acid is 90 S cm² mol⁻¹, its degree of dissociation is:",
      "options": ["0.215", "0.115", "0.125", "0.225"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Degree of dissociation α = Λm / Λm° = 90 / 400 = 0.225."
    },
    {
      "question": "Statement I: A diatomic molecule with bond order zero is stable. Statement II: Bond length increases with bond order.",
      "options": ["Statement I false, Statement II true", "Both true", "Both false", "Statement I true, Statement II false"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Bond order zero means unstable; bond length decreases with bond order."
    },
    {
      "question": "Ratio of wavelengths absorbed by hydrogen atom during transitions 2→3 and 4→6 is:",
      "options": ["1/4", "1/36", "1/16", "1/9"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "chemistry-physical",
      "explanation": "Using Rydberg formula, the ratio is 1/4."
    },
    {
      "question": "Correct order of wavelength absorbed by complexes is:",
      "options": ["C < A < D < B", "B < D < A < C", "B < A < D < C", "C < D < A < B"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "chemistry-physical",
      "explanation": "Strong ligand causes higher splitting and lower wavelength."
    },
    {
      "question": "Time taken for concentration to reduce from 7.2 M to 0.9 M for a first order reaction is:",
      "options": ["21.0 s", "69.3 s", "23.1 s", "210 s"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Using first order kinetics equation."
    },
    {
      "question": "Match the mixtures with separation techniques.",
      "options": ["A-IV, B-III, C-I, D-II", "A-IV, B-III, C-II, D-I", "A-III, B-IV, C-II, D-I", "A-III, B-IV, C-I, D-II"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Standard separation methods."
    },
    {
      "question": "Which sets have equal number of atoms?",
      "options": ["B, D, and E", "A, B, and C", "A, B, and D", "B, C, and D"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "chemistry-physical",
      "explanation": "Calculating number of atoms using molar mass."
    },
    {
      "question": "Standard heat of formation of Ba²⁺ ion is:",
      "options": ["+220.5", "−128.5", "−133.0", "+133.0"],
      "correctAnswer": 1,
      "difficulty": "hard",
      "subcategory": "chemistry-physical",
      "explanation": "Using Hess's law."
    },
    {
      "question": "Which of the following is not a colligative property?",
      "options": ["Lowering of vapour pressure", "Elevation of boiling point", "Depression of freezing point", "Osmotic pressure"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Lowering of vapour pressure is not classified as a colligative property."
    },
    {
      "question": "Which gas has maximum rms velocity at same temperature?",
      "options": ["O2", "N2", "CO2", "H2"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Lower molar mass gives higher rms velocity."
    },
    {
      "question": "The pH of a neutral solution at 25°C is:",
      "options": ["5", "6", "7", "8"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "At 25°C, neutral pH is 7."
    },
    {
      "question": "Which of the following is a Lewis acid?",
      "options": ["NH3", "BF3", "OH⁻", "H2O"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "BF3 can accept an electron pair."
    },
    {
      "question": "Which of the following is a strong electrolyte?",
      "options": ["CH3COOH", "NH4OH", "NaCl", "H2CO3"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "NaCl completely dissociates in water."
    },
    {
      "question": "The value of equilibrium constant Kp is related to Kc by:",
      "options": ["Kp = Kc", "Kp = Kc(RT)^Δn", "Kp = Kc/RT", "Kp = Kc(RT)"],
      "correctAnswer": 1,
      "difficulty": "medium",
      "subcategory": "chemistry-physical",
      "explanation": "Kp = Kc(RT)^Δn for gaseous reactions."
    },
    {
      "question": "Which compound shows maximum hydrogen bonding?",
      "options": ["H2O", "HF", "NH3", "H2S"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Water forms extensive hydrogen bonding."
    },
    {
      "question": "The rate constant of a reaction depends on:",
      "options": ["Temperature", "Catalyst", "Nature of reactants", "All of these"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "All listed factors affect reaction rate."
    },
    {
      "question": "Which of the following is a heterogeneous catalyst?",
      "options": ["Ni in hydrogenation", "HCl in esterification", "Enzyme", "Acid in solution"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Ni is solid while reactants are gases."
    },
    {
      "question": "Which polymer is used in making bulletproof jackets?",
      "options": ["Nylon-6", "PVC", "Teflon", "Kevlar"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Kevlar has very high tensile strength."
    },
    {
      "question": "Which vitamin is water soluble?",
      "options": ["Vitamin A", "Vitamin D", "Vitamin E", "Vitamin C"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Vitamin C is water soluble."
    },
    {
      "question": "Which reagent is used to distinguish aldehyde and ketone?",
      "options": ["Fehling solution", "Grignard reagent", "NaOH", "HCl"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Fehling solution reacts with aldehydes."
    },
    {
      "question": "Which compound is used as an antifreeze?",
      "options": ["Methanol", "Ethanol", "Ethylene glycol", "Glycerol"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Ethylene glycol lowers freezing point."
    },
    {
      "question": "The molarity of pure water is approximately:",
      "options": ["18 M", "55.5 M", "1 M", "100 M"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "chemistry-physical",
      "explanation": "Moles of water per litre is about 55.5."
    },
    
    // Biology - Botany
    {
      "question": "What is the powerhouse of the cell?",
      "options": ["Mitochondria", "Nucleus", "Ribosome", "Golgi body"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-botany"
    },
    {
      "question": "Photosynthesis occurs in which organelle?",
      "options": ["Chloroplast", "Mitochondria", "Nucleus", "Ribosome"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-botany"
    },
    {
      "question": "Which pigment is responsible for green color in plants?",
      "options": ["Chlorophyll", "Carotene", "Xanthophyll", "Anthocyanin"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-botany"
    },
    {
      "question": "The C4 pathway of photosynthesis was discovered by:",
      "options": ["Hatch and Slack", "Calvin", "Krebs", "Watson and Crick"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "biology-botany"
    },
    {
      "question": "Transpiration pull theory was given by:",
      "options": ["Dixon and Joly", "Calvin", "Hatch and Slack", "Blackman"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "biology-botany"
    },
    
    // Biology - Zoology
    {
      "question": "How many chambers does the human heart have?",
      "options": ["4", "2", "3", "5"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-zoology"
    },
    {
      "question": "Which blood cells are responsible for immunity?",
      "options": ["White blood cells", "Red blood cells", "Platelets", "Plasma"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-zoology"
    },
    {
      "question": "DNA replication is:",
      "options": ["Semi-conservative", "Conservative", "Dispersive", "Random"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "biology-zoology"
    },
    {
      "question": "The law of independent assortment was given by:",
      "options": ["Mendel", "Darwin", "Lamarck", "Morgan"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-zoology"
    },
    {
      "question": "The theory of natural selection was proposed by:",
      "options": ["Charles Darwin", "Lamarck", "Mendel", "Hugo de Vries"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-zoology"
    },
    {
      "question": "Which of the following is the functional unit of kidney?",
      "options": ["Glomerulus", "Nephron", "Tubule", "Osteon"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Nephron is the structural and functional unit of kidney."
    },
    {
      "question": "The site of fertilization in human female is:",
      "options": ["Uterus", "Cervix", "Fallopian tube", "Ovary"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Fertilization occurs in the ampulla of fallopian tube."
    },
    {
      "question": "Which hormone regulates blood glucose level?",
      "options": ["Glucagon", "Insulin", "Thyroxine", "Melatonin"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Insulin lowers blood glucose concentration."
    },
    {
      "question": "Which part of brain controls heartbeat and breathing?",
      "options": ["Cerebrum", "Cerebellum", "Medulla oblongata", "Hypothalamus"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Medulla oblongata regulates vital involuntary functions."
    },
    {
      "question": "Which blood group is universal donor?",
      "options": ["A", "B", "AB", "O"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "O group lacks A and B antigens."
    },
    {
      "question": "The structural and functional unit of nervous system is:",
      "options": ["Neuron", "Axon", "Synapse", "Dendrite"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Neuron transmits nerve impulses."
    },
    {
      "question": "Which vitamin deficiency causes night blindness?",
      "options": ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Vitamin A is required for vision."
    },
    {
      "question": "Which enzyme digests proteins in stomach?",
      "options": ["Amylase", "Trypsin", "Pepsin", "Lipase"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Pepsin breaks proteins into peptides."
    },
    {
      "question": "Which disease is caused by deficiency of insulin?",
      "options": ["Goiter", "Diabetes mellitus", "Hypertension", "Rickets"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Diabetes mellitus results from lack of insulin."
    },
    {
      "question": "The process of formation of gametes is called:",
      "options": ["Mitosis", "Gametogenesis", "Meiosis", "Cleavage"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Gametes are formed during gametogenesis."
    },
    {
      "question": "Which chromosome determines sex in humans?",
      "options": ["Autosome", "X only", "Y only", "Both X and Y"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Combination of X and Y chromosomes determines sex."
    },
    {
      "question": "Which blood cells help in clotting?",
      "options": ["RBC", "WBC", "Platelets", "Plasma"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Platelets are responsible for clotting."
    },
    {
      "question": "Which hormone is known as stress hormone?",
      "options": ["Insulin", "Adrenaline", "Thyroxine", "Progesterone"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Adrenaline is released during stress."
    },
    {
      "question": "Which organ detoxifies blood in humans?",
      "options": ["Kidney", "Heart", "Liver", "Lungs"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Liver removes toxins from blood."
    },
    {
      "question": "Which is the largest gland in human body?",
      "options": ["Pancreas", "Thyroid", "Liver", "Adrenal"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Liver is the largest gland."
    },
    {
      "question": "Which blood vessel carries oxygenated blood from lungs to heart?",
      "options": ["Pulmonary artery", "Pulmonary vein", "Aorta", "Vena cava"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Pulmonary vein carries oxygenated blood."
    },
    {
      "question": "Which disease is caused by vitamin D deficiency?",
      "options": ["Scurvy", "Rickets", "Beri-beri", "Pellagra"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Vitamin D deficiency causes rickets."
    },
    {
      "question": "Which organ is affected in hepatitis?",
      "options": ["Heart", "Liver", "Kidney", "Lungs"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Hepatitis is inflammation of liver."
    },
    {
      "question": "Which phase of cell cycle shows DNA replication?",
      "options": ["G1 phase", "S phase", "G2 phase", "M phase"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "DNA replication occurs during S phase."
    },
    {
      "question": "Which part of human ear maintains balance?",
      "options": ["Cochlea", "Auditory nerve", "Semicircular canals", "Eardrum"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Semicircular canals help maintain balance."
    },
    {
      "question": "Which organelle contains hydrolytic enzymes?",
      "options": ["Lysosome", "Ribosome", "Peroxisome", "Mitochondria"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Lysosomes contain digestive enzymes."
    },
    {
      "question": "Which process produces ATP in mitochondria?",
      "options": ["Glycolysis", "Krebs cycle", "Oxidative phosphorylation", "Fermentation"],
      "correctAnswer": 2,
      "difficulty": "medium",
      "subcategory": "biology-zoology",
      "explanation": "ATP is mainly produced during oxidative phosphorylation."
    },
    {
      "question": "Which blood group is universal recipient?",
      "options": ["A", "B", "AB", "O"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "AB group can receive blood from all groups."
    },
    {
      "question": "Which enzyme converts starch into maltose?",
      "options": ["Pepsin", "Trypsin", "Amylase", "Lipase"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Amylase breaks starch into maltose."
    },
    {
      "question": "Which hormone regulates sleep-wake cycle?",
      "options": ["Insulin", "Melatonin", "Growth hormone", "Adrenaline"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Melatonin regulates circadian rhythm."
    },
    {
      "question": "Which type of reproduction involves fusion of gametes?",
      "options": ["Asexual", "Budding", "Sexual", "Binary fission"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Sexual reproduction involves gamete fusion."
    },
    {
      "question": "Which vitamin deficiency causes scurvy?",
      "options": ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Vitamin C deficiency causes scurvy."
    },
    {
      "question": "Which gas is responsible for greenhouse effect?",
      "options": ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "CO2 contributes to greenhouse effect."
    },
    {
      "question": "Which part of nephron filters blood?",
      "options": ["Loop of Henle", "Collecting duct", "Glomerulus", "Tubule"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Glomerulus filters blood."
    },
    {
      "question": "Which type of immunity is provided by vaccines?",
      "options": ["Natural active", "Natural passive", "Artificial active", "Artificial passive"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Vaccines provide artificial active immunity."
    },
    {
      "question": "Which organ stores bile?",
      "options": ["Liver", "Pancreas", "Gall bladder", "Duodenum"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Gall bladder stores bile."
    },
    {
      "question": "Which structure carries genetic information?",
      "options": ["RNA", "Protein", "DNA", "Carbohydrate"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "DNA stores genetic information."
    },
    {
      "question": "Which process removes nitrogenous waste in humans?",
      "options": ["Respiration", "Digestion", "Excretion", "Circulation"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Excretion removes waste."
    },
    {
      "question": "Which organ controls body temperature?",
      "options": ["Cerebrum", "Hypothalamus", "Medulla", "Thalamus"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Hypothalamus regulates temperature."
    },
    {
      "question": "Which enzyme digests fats?",
      "options": ["Amylase", "Pepsin", "Lipase", "Trypsin"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Lipase digests fats."
    },
    {
      "question": "Which type of blood vessel has valves?",
      "options": ["Artery", "Vein", "Capillary", "Aorta"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Veins contain valves."
    },
    {
      "question": "Which structure connects muscle to bone?",
      "options": ["Ligament", "Tendon", "Cartilage", "Joint"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Tendon connects muscle to bone."
    },
    {
      "question": "Which disease is caused by Plasmodium?",
      "options": ["Typhoid", "Malaria", "Tuberculosis", "Cholera"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Plasmodium causes malaria."
    },
    {
      "question": "Which cell lacks nucleus?",
      "options": ["WBC", "RBC", "Nerve cell", "Muscle cell"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Mature RBC lacks nucleus."
    },
    {
      "question": "Which hormone stimulates milk production?",
      "options": ["Oxytocin", "Prolactin", "Estrogen", "Progesterone"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Prolactin stimulates milk production."
    },
    {
      "question": "Which organ produces insulin?",
      "options": ["Liver", "Pancreas", "Kidney", "Stomach"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Pancreas produces insulin."
    },
    {
      "question": "Which process converts glucose into pyruvate?",
      "options": ["Krebs cycle", "Glycolysis", "Calvin cycle", "Electron transport"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Glycolysis converts glucose into pyruvate."
    },
    {
      "question": "Which organelle is called suicidal bag of cell?",
      "options": ["Ribosome", "Lysosome", "Mitochondria", "Golgi"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Lysosome contains hydrolytic enzymes."
    },
    {
      "question": "Which blood component transports oxygen?",
      "options": ["Plasma", "Platelets", "Hemoglobin", "WBC"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Hemoglobin carries oxygen."
    },
    {
      "question": "Which structure connects two neurons?",
      "options": ["Axon", "Dendrite", "Synapse", "Myelin"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Synapse connects neurons."
    },
    {
      "question": "Which disease is caused by virus?",
      "options": ["Typhoid", "Tuberculosis", "Measles", "Cholera"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Measles is a viral disease."
    },
    {
      "question": "Which part of DNA carries genetic information?",
      "options": ["Sugar", "Phosphate", "Nitrogenous bases", "Helix"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Sequence of nitrogenous bases carries information."
    },
    {
      "question": "Which enzyme helps in DNA replication?",
      "options": ["RNA polymerase", "DNA polymerase", "Ligase", "Helicase"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "DNA polymerase synthesizes new DNA strand."
    },
    {
      "question": "Which organ is affected in jaundice?",
      "options": ["Kidney", "Liver", "Heart", "Lungs"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Jaundice affects liver."
    },
    {
      "question": "Which gas is released in respiration?",
      "options": ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "CO₂ is released during respiration."
    },
    {
      "question": "Which structure protects brain?",
      "options": ["Vertebra", "Ribs", "Skull", "Pelvis"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Skull protects brain."
    },
    {
      "question": "Which tissue is responsible for movement?",
      "options": ["Epithelial", "Connective", "Muscular", "Nervous"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Muscular tissue enables movement."
    },
    {
      "question": "Which hormone causes uterine contraction during childbirth?",
      "options": ["Estrogen", "Oxytocin", "FSH", "Progesterone"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Oxytocin causes uterine contraction."
    },
    {
      "question": "Which vitamin is synthesized in skin by sunlight?",
      "options": ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Vitamin D is synthesized in skin."
    },
    {
      "question": "Which blood group has no antibodies?",
      "options": ["A", "B", "AB", "O"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "AB blood group has no antibodies."
    },
    {
      "question": "Which gas is used in artificial respiration?",
      "options": ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Oxygen is supplied during artificial respiration."
    },
    {
      "question": "Which organ produces bile?",
      "options": ["Pancreas", "Gall bladder", "Liver", "Intestine"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Liver produces bile."
    },
    {
      "question": "Which structure stores genetic material in cell?",
      "options": ["Ribosome", "Nucleus", "Mitochondria", "Golgi"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Nucleus stores genetic material."
    },
    {
      "question": "Which organism causes AIDS?",
      "options": ["Bacteria", "Virus", "Protozoa", "Fungus"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "AIDS is caused by HIV virus."
    },
    {
      "question": "Which process produces oxygen in photosynthesis?",
      "options": ["Dark reaction", "Light reaction", "Calvin cycle", "Respiration"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Light reaction splits water to release oxygen."
    },
    {
      "question": "Which hormone regulates metabolism?",
      "options": ["Insulin", "Thyroxine", "Adrenaline", "Melatonin"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Thyroxine regulates metabolism."
    },
    {
      "question": "Which part of brain is responsible for intelligence?",
      "options": ["Medulla", "Cerebellum", "Cerebrum", "Pons"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Cerebrum controls intelligence."
    },
    {
      "question": "Which tissue conducts impulses?",
      "options": ["Epithelial", "Connective", "Muscular", "Nervous"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Nervous tissue conducts impulses."
    },
    {
      "question": "Which mineral is required for hemoglobin formation?",
      "options": ["Calcium", "Iodine", "Iron", "Sodium"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Iron is required for hemoglobin."
    },
    {
      "question": "Which disease affects lungs?",
      "options": ["Hepatitis", "Tuberculosis", "Diabetes", "Jaundice"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Tuberculosis affects lungs."
    },
    {
      "question": "Which part of tongue detects taste?",
      "options": ["Papillae", "Taste buds", "Epithelium", "Mucosa"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-zoology",
      "explanation": "Tongue contains taste buds."
    },
    {
      "question": "Which plant hormone promotes cell elongation?",
      "options": ["Cytokinin", "Auxin", "Gibberellin", "Abscisic acid"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Auxins promote cell elongation."
    },
    {
      "question": "Which tissue transports water in plants?",
      "options": ["Phloem", "Xylem", "Parenchyma", "Cortex"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Xylem conducts water and minerals."
    },
    {
      "question": "The powerhouse of the cell is:",
      "options": ["Chloroplast", "Mitochondria", "Nucleus", "Golgi body"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Mitochondria generate ATP."
    },
    {
      "question": "Which gas is released during photosynthesis?",
      "options": ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Oxygen is released as a by-product."
    },
    {
      "question": "Which cell organelle is involved in protein synthesis?",
      "options": ["Mitochondria", "Ribosome", "Chloroplast", "Golgi"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Ribosomes synthesize proteins."
    },
    {
      "question": "Which part of flower develops into fruit?",
      "options": ["Petal", "Ovary", "Stamen", "Sepal"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Ovary matures into fruit."
    },
    {
      "question": "Which process involves movement of water across membrane?",
      "options": ["Diffusion", "Osmosis", "Active transport", "Translocation"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Osmosis is movement of water through semipermeable membrane."
    },
    {
      "question": "Which pigment gives green color to plants?",
      "options": ["Carotene", "Xanthophyll", "Chlorophyll", "Anthocyanin"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Chlorophyll absorbs light for photosynthesis."
    },
    {
      "question": "Which bacteria fixes nitrogen in legumes?",
      "options": ["Azotobacter", "Rhizobium", "Clostridium", "Nitrosomonas"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Rhizobium fixes nitrogen in legumes."
    },
    {
      "question": "Which part of eye controls pupil size?",
      "options": ["Retina", "Lens", "Iris", "Cornea"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Iris regulates pupil size."
    },
    {
      "question": "Which hormone induces flowering in plants?",
      "options": ["Auxin", "Florigen", "Cytokinin", "Ethylene"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Florigen is responsible for flowering."
    },
    {
      "question": "Which plant tissue is responsible for growth in length?",
      "options": ["Lateral meristem", "Apical meristem", "Cambium", "Permanent tissue"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Apical meristem increases length."
    },
    {
      "question": "Which plant hormone promotes fruit ripening?",
      "options": ["Auxin", "Ethylene", "Gibberellin", "Cytokinin"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Ethylene promotes ripening."
    },
    {
      "question": "Which plant hormone inhibits growth?",
      "options": ["Auxin", "Gibberellin", "Cytokinin", "Abscisic acid"],
      "correctAnswer": 3,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Abscisic acid inhibits growth."
    },
    {
      "question": "Which part of flower produces pollen grains?",
      "options": ["Ovary", "Stigma", "Anther", "Filament"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Anther produces pollen."
    },
    {
      "question": "Which plant tissue provides mechanical support?",
      "options": ["Parenchyma", "Collenchyma", "Sclerenchyma", "Phloem"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Sclerenchyma provides rigidity."
    },
    {
      "question": "Which structure regulates entry of substances into cell?",
      "options": ["Cell wall", "Cytoplasm", "Cell membrane", "Nucleus"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Cell membrane is selectively permeable."
    },
    {
      "question": "Which part of plant performs photosynthesis?",
      "options": ["Root", "Stem", "Leaves", "Flower"],
      "correctAnswer": 2,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Leaves perform photosynthesis."
    },
    {
      "question": "Which part of plant conducts food?",
      "options": ["Xylem", "Phloem", "Cambium", "Cortex"],
      "correctAnswer": 1,
      "difficulty": "easy",
      "subcategory": "biology-botany",
      "explanation": "Phloem transports food."
    }
  ],

  // ==================== ARTIFICIAL INTELLIGENCE ====================
  "artificial-intelligence": [
    {
      "question": "What does AI stand for?",
      "options": ["Artificial Intelligence", "Automated Intelligence", "Advanced Integration", "Automatic Interface"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "ml-basics"
    },
    {
      "question": "What is Machine Learning?",
      "options": ["A subset of AI that learns from data", "A programming language", "A database system", "A networking protocol"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "ml-basics"
    },
    {
      "question": "What is supervised learning?",
      "options": ["Learning with labeled training data", "Learning without any data", "Learning from unlabeled data", "Learning through trial and error"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "ml-basics"
    },
    {
      "question": "What is unsupervised learning?",
      "options": ["Learning from unlabeled data to find patterns", "Learning with labels", "Reinforcement learning", "Transfer learning"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "ml-basics"
    },
    {
      "question": "What is overfitting in machine learning?",
      "options": ["Model performs well on training but poorly on new data", "Model is too simple", "Model runs too fast", "Model uses too little data"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "ml-basics"
    },
    {
      "question": "What is a neural network?",
      "options": ["A computing system inspired by biological neural networks", "A type of database", "A programming language", "A networking protocol"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "deep-learning"
    },
    {
      "question": "What is the activation function in neural networks?",
      "options": ["A function that determines the output of a neuron", "A data structure", "A sorting algorithm", "A database operation"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "deep-learning"
    },
    {
      "question": "What is backpropagation?",
      "options": ["Algorithm to compute gradients for training neural networks", "A sorting algorithm", "A database backup method", "A network protocol"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "deep-learning"
    },
    {
      "question": "What is a Convolutional Neural Network (CNN)?",
      "options": ["Neural network specialized for processing grid-like data like images", "A database system", "A programming language", "A networking protocol"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "deep-learning"
    },
    {
      "question": "What is the vanishing gradient problem?",
      "options": ["Gradients become very small during backpropagation in deep networks", "A hardware issue", "A database problem", "A network latency issue"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "deep-learning"
    },
    {
      "question": "What is Natural Language Processing?",
      "options": ["AI's ability to understand and generate human language", "A programming language", "A database query language", "A networking protocol"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "nlp"
    },
    {
      "question": "What is attention mechanism in transformers?",
      "options": ["Allows model to focus on relevant parts of input", "A type of database index", "A sorting algorithm", "A memory allocation technique"],
      "correctAnswer": 0,
      "difficulty": "hard",
      "subcategory": "nlp"
    },
    {
      "question": "What is transfer learning?",
      "options": ["Using a pre-trained model as starting point for a new task", "Moving data between databases", "A type of neural network", "A programming concept"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "ml-basics"
    }
  ],

  // ==================== DATA SCIENCE ====================
  "data-science": [
    {
      "question": "What is data science?",
      "options": ["Field that extracts insights from data using statistics and ML", "A programming language", "A database system", "A networking concept"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "python"
    },
    {
      "question": "What is pandas in Python?",
      "options": ["A library for data manipulation and analysis", "A web framework", "A game engine", "A database"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "python"
    },
    {
      "question": "What is a DataFrame?",
      "options": ["A 2D labeled data structure in pandas", "A type of database", "A programming language", "A web component"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "python"
    },
    {
      "question": "What is NumPy?",
      "options": ["A Python library for numerical computations with arrays", "A database system", "A web framework", "A testing library"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "python"
    },
    {
      "question": "What is feature engineering?",
      "options": ["Creating new features from existing data to improve model performance", "Building software features", "Hardware design", "Network configuration"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "python"
    },
    {
      "question": "What is cross-validation?",
      "options": ["Technique to assess model performance by splitting data multiple times", "A type of encryption", "A database operation", "A network protocol"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "statistics"
    },
    {
      "question": "What is the purpose of data normalization?",
      "options": ["Scaling features to a standard range", "Deleting data", "Encrypting data", "Compressing data"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "statistics"
    },
    {
      "question": "What is the difference between correlation and causation?",
      "options": ["Correlation shows relationship, causation proves one causes the other", "They are identical", "Causation is weaker", "Correlation always implies causation"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "statistics"
    },
    {
      "question": "What is matplotlib used for?",
      "options": ["Creating visualizations and plots in Python", "Web development", "Database management", "Network security"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "visualization"
    },
    {
      "question": "What is seaborn?",
      "options": ["A statistical data visualization library built on matplotlib", "A database", "A web framework", "A testing tool"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "visualization"
    }
  ],

  // ==================== NETWORKING ====================
  "networking": [
    {
      "question": "What does IP stand for?",
      "options": ["Internet Protocol", "Internal Process", "Input Port", "Interface Program"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "protocols"
    },
    {
      "question": "What does HTTP stand for?",
      "options": ["HyperText Transfer Protocol", "High Transfer Text Protocol", "Hyper Technical Transfer Process", "Home Text Transfer Protocol"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "protocols"
    },
    {
      "question": "What is DNS?",
      "options": ["Domain Name System - translates domain names to IP addresses", "Data Network System", "Digital Network Service", "Domain Network Security"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "protocols"
    },
    {
      "question": "What is TCP/IP?",
      "options": ["Suite of communication protocols for the internet", "A programming language", "A database system", "A web framework"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "protocols"
    },
    {
      "question": "What is the difference between TCP and UDP?",
      "options": ["TCP is reliable/ordered, UDP is faster but unreliable", "They are identical", "UDP is more reliable", "TCP is faster"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "protocols"
    },
    {
      "question": "What is a firewall?",
      "options": ["Security system that monitors and controls network traffic", "A type of cable", "A programming language", "A database system"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "security"
    },
    {
      "question": "What is a VPN?",
      "options": ["Virtual Private Network - secure tunnel over public network", "Virtual Processing Node", "Verified Public Network", "Variable Protocol Network"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "security"
    },
    {
      "question": "What is encryption?",
      "options": ["Converting data into coded form to prevent unauthorized access", "Compressing data", "Deleting data", "Backing up data"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "security"
    },
    {
      "question": "What is the OSI model?",
      "options": ["7-layer conceptual framework for network communication", "A programming pattern", "A database model", "A security protocol"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "architecture"
    },
    {
      "question": "What is a router?",
      "options": ["Device that forwards data packets between networks", "A programming tool", "A database", "A web browser"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "subcategory": "architecture"
    },
    {
      "question": "What is a subnet mask?",
      "options": ["Divides IP address into network and host portions", "A security feature", "A type of cable", "A programming concept"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "architecture"
    },
    {
      "question": "What is NAT?",
      "options": ["Network Address Translation - maps private to public IPs", "Network Access Tool", "Node Allocation Table", "Network Analysis Type"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "subcategory": "architecture"
    }
  ]
}

// Flatten questions with unique IDs
let questionId = 1
const questions = []

Object.entries(questionsData).forEach(([category, categoryQuestions]) => {
  categoryQuestions.forEach(q => {
    questions.push({
      id: questionId++,
      category,
      ...q
    })
  })
})

module.exports = questions
