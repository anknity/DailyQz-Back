const { supabaseAdmin } = require('../src/config/supabase');

// NIMCET Computer Science questions data
const nimcetData = {
  "exam": "NIMCET",
  "subject": "Computer Science",
  "questions": [
    // 2008 Questions (15 questions)
    { "id": 1, "year": 2008, "question": "NIMCET 2008 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 2, "year": 2008, "question": "NIMCET 2008 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 3, "year": 2008, "question": "NIMCET 2008 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 4, "year": 2008, "question": "NIMCET 2008 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 5, "year": 2008, "question": "NIMCET 2008 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 6, "year": 2008, "question": "NIMCET 2008 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 7, "year": 2008, "question": "NIMCET 2008 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 8, "year": 2008, "question": "NIMCET 2008 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 9, "year": 2008, "question": "NIMCET 2008 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 10, "year": 2008, "question": "NIMCET 2008 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 11, "year": 2008, "question": "NIMCET 2008 Question 11", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 12, "year": 2008, "question": "NIMCET 2008 Question 12", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 13, "year": 2008, "question": "NIMCET 2008 Question 13", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 14, "year": 2008, "question": "NIMCET 2008 Question 14", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 15, "year": 2008, "question": "NIMCET 2008 Question 15", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    
    // 2009 Questions (10 questions)
    { "id": 16, "year": 2009, "question": "NIMCET 2009 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 17, "year": 2009, "question": "NIMCET 2009 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 18, "year": 2009, "question": "NIMCET 2009 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 19, "year": 2009, "question": "NIMCET 2009 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 20, "year": 2009, "question": "NIMCET 2009 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 21, "year": 2009, "question": "NIMCET 2009 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 22, "year": 2009, "question": "NIMCET 2009 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 23, "year": 2009, "question": "NIMCET 2009 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 24, "year": 2009, "question": "NIMCET 2009 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 25, "year": 2009, "question": "NIMCET 2009 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    
    // 2010-2022 Questions (130 questions from the remaining file)
    { "id": 51, "year": 2010, "question": "NIMCET 2010 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 52, "year": 2010, "question": "NIMCET 2010 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 53, "year": 2010, "question": "NIMCET 2010 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 54, "year": 2010, "question": "NIMCET 2010 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 55, "year": 2010, "question": "NIMCET 2010 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 56, "year": 2010, "question": "NIMCET 2010 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 57, "year": 2010, "question": "NIMCET 2010 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 58, "year": 2010, "question": "NIMCET 2010 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 59, "year": 2010, "question": "NIMCET 2010 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 60, "year": 2010, "question": "NIMCET 2010 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 61, "year": 2011, "question": "NIMCET 2011 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 62, "year": 2011, "question": "NIMCET 2011 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 63, "year": 2011, "question": "NIMCET 2011 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 64, "year": 2011, "question": "NIMCET 2011 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 65, "year": 2011, "question": "NIMCET 2011 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 66, "year": 2011, "question": "NIMCET 2011 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 67, "year": 2011, "question": "NIMCET 2011 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 68, "year": 2011, "question": "NIMCET 2011 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 69, "year": 2011, "question": "NIMCET 2011 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 70, "year": 2011, "question": "NIMCET 2011 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 71, "year": 2012, "question": "NIMCET 2012 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 72, "year": 2012, "question": "NIMCET 2012 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 73, "year": 2012, "question": "NIMCET 2012 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 74, "year": 2012, "question": "NIMCET 2012 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 75, "year": 2012, "question": "NIMCET 2012 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 76, "year": 2012, "question": "NIMCET 2012 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 77, "year": 2012, "question": "NIMCET 2012 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 78, "year": 2012, "question": "NIMCET 2012 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 79, "year": 2012, "question": "NIMCET 2012 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 80, "year": 2012, "question": "NIMCET 2012 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 81, "year": 2013, "question": "NIMCET 2013 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 82, "year": 2013, "question": "NIMCET 2013 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 83, "year": 2013, "question": "NIMCET 2013 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 84, "year": 2013, "question": "NIMCET 2013 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 85, "year": 2013, "question": "NIMCET 2013 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 86, "year": 2013, "question": "NIMCET 2013 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 87, "year": 2013, "question": "NIMCET 2013 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 88, "year": 2013, "question": "NIMCET 2013 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 89, "year": 2013, "question": "NIMCET 2013 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 90, "year": 2013, "question": "NIMCET 2013 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 91, "year": 2014, "question": "NIMCET 2014 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 92, "year": 2014, "question": "NIMCET 2014 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 93, "year": 2014, "question": "NIMCET 2014 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 94, "year": 2014, "question": "NIMCET 2014 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 95, "year": 2014, "question": "NIMCET 2014 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 96, "year": 2014, "question": "NIMCET 2014 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 97, "year": 2014, "question": "NIMCET 2014 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 98, "year": 2014, "question": "NIMCET 2014 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 99, "year": 2014, "question": "NIMCET 2014 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 100, "year": 2014, "question": "NIMCET 2014 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 101, "year": 2015, "question": "NIMCET 2015 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 102, "year": 2015, "question": "NIMCET 2015 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 103, "year": 2015, "question": "NIMCET 2015 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 104, "year": 2015, "question": "NIMCET 2015 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 105, "year": 2015, "question": "NIMCET 2015 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 106, "year": 2015, "question": "NIMCET 2015 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 107, "year": 2015, "question": "NIMCET 2015 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 108, "year": 2015, "question": "NIMCET 2015 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 109, "year": 2015, "question": "NIMCET 2015 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 110, "year": 2015, "question": "NIMCET 2015 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 111, "year": 2016, "question": "NIMCET 2016 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 112, "year": 2016, "question": "NIMCET 2016 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 113, "year": 2016, "question": "NIMCET 2016 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 114, "year": 2016, "question": "NIMCET 2016 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 115, "year": 2016, "question": "NIMCET 2016 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 116, "year": 2016, "question": "NIMCET 2016 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 117, "year": 2016, "question": "NIMCET 2016 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 118, "year": 2016, "question": "NIMCET 2016 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 119, "year": 2016, "question": "NIMCET 2016 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 120, "year": 2016, "question": "NIMCET 2016 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 121, "year": 2017, "question": "NIMCET 2017 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 122, "year": 2017, "question": "NIMCET 2017 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 123, "year": 2017, "question": "NIMCET 2017 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 124, "year": 2017, "question": "NIMCET 2017 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 125, "year": 2017, "question": "NIMCET 2017 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 126, "year": 2017, "question": "NIMCET 2017 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 127, "year": 2017, "question": "NIMCET 2017 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 128, "year": 2017, "question": "NIMCET 2017 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 129, "year": 2017, "question": "NIMCET 2017 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 130, "year": 2017, "question": "NIMCET 2017 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 131, "year": 2018, "question": "NIMCET 2018 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 132, "year": 2018, "question": "NIMCET 2018 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 133, "year": 2018, "question": "NIMCET 2018 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 134, "year": 2018, "question": "NIMCET 2018 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 135, "year": 2018, "question": "NIMCET 2018 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 136, "year": 2018, "question": "NIMCET 2018 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 137, "year": 2018, "question": "NIMCET 2018 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 138, "year": 2018, "question": "NIMCET 2018 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 139, "year": 2018, "question": "NIMCET 2018 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 140, "year": 2018, "question": "NIMCET 2018 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 141, "year": 2019, "question": "NIMCET 2019 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 142, "year": 2019, "question": "NIMCET 2019 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 143, "year": 2019, "question": "NIMCET 2019 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 144, "year": 2019, "question": "NIMCET 2019 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 145, "year": 2019, "question": "NIMCET 2019 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 146, "year": 2019, "question": "NIMCET 2019 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 147, "year": 2019, "question": "NIMCET 2019 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 148, "year": 2019, "question": "NIMCET 2019 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 149, "year": 2019, "question": "NIMCET 2019 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 150, "year": 2019, "question": "NIMCET 2019 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 151, "year": 2020, "question": "NIMCET 2020 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 152, "year": 2020, "question": "NIMCET 2020 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 153, "year": 2020, "question": "NIMCET 2020 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 154, "year": 2020, "question": "NIMCET 2020 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 155, "year": 2020, "question": "NIMCET 2020 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 156, "year": 2020, "question": "NIMCET 2020 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 157, "year": 2020, "question": "NIMCET 2020 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 158, "year": 2020, "question": "NIMCET 2020 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 159, "year": 2020, "question": "NIMCET 2020 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 160, "year": 2020, "question": "NIMCET 2020 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 161, "year": 2021, "question": "NIMCET 2021 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 162, "year": 2021, "question": "NIMCET 2021 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 163, "year": 2021, "question": "NIMCET 2021 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 164, "year": 2021, "question": "NIMCET 2021 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 165, "year": 2021, "question": "NIMCET 2021 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 166, "year": 2021, "question": "NIMCET 2021 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 167, "year": 2021, "question": "NIMCET 2021 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 168, "year": 2021, "question": "NIMCET 2021 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 169, "year": 2021, "question": "NIMCET 2021 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 170, "year": 2021, "question": "NIMCET 2021 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 171, "year": 2022, "question": "NIMCET 2022 Question 1", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" },
    { "id": 172, "year": 2022, "question": "NIMCET 2022 Question 2", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 173, "year": 2022, "question": "NIMCET 2022 Question 3", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 174, "year": 2022, "question": "NIMCET 2022 Question 4", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 175, "year": 2022, "question": "NIMCET 2022 Question 5", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "A" },
    { "id": 176, "year": 2022, "question": "NIMCET 2022 Question 6", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 177, "year": 2022, "question": "NIMCET 2022 Question 7", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 178, "year": 2022, "question": "NIMCET 2022 Question 8", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "D" },
    { "id": 179, "year": 2022, "question": "NIMCET 2022 Question 9", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "B" },
    { "id": 180, "year": 2022, "question": "NIMCET 2022 Question 10", "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" }, "answer": "C" }
  ]
};

// Computer subject distribution - rotate through subcategories
const computerSubjects = [
  'nimcet-computer-fundamentals',
  'nimcet-computer-programming',
  'nimcet-computer-dbms',
  'nimcet-computer-networks',
  'nimcet-computer-os'
];

// Helper to convert answer letter (A,B,C,D) to index (0,1,2,3)
function answerToIndex(letter) {
  const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
  return map[letter.toUpperCase()] !== undefined ? map[letter.toUpperCase()] : 0;
}

async function importQuestions() {
  try {
    console.log('🚀 Starting NIMCET Computer Science questions import...\n');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < nimcetData.questions.length; i++) {
      const q = nimcetData.questions[i];
      
      // Assign subject cyclically
      const subject = computerSubjects[i % computerSubjects.length];
      
      // Prepare question data for Supabase
      const questionData = {
        question_text: q.question,
        options: [
          q.options.A,
          q.options.B,
          q.options.C,
          q.options.D
        ],
        correct_answer: answerToIndex(q.answer),
        category: 'nimcet',
        subject: subject,
        difficulty: 'medium',
        source: `NIMCET ${q.year}`,
        is_approved: true,
        approved_by: 'admin',
        approved_at: new Date().toISOString()
      };

      // Insert into Supabase
      const { data, error } = await supabaseAdmin
        .from('question_bank')
        .insert([questionData])
        .select();

      if (error) {
        errorCount++;
        errors.push({
          question: q.question,
          error: error.message
        });
        console.log(`❌ Error importing question ${i + 1}: ${error.message}`);
      } else {
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`✅ Imported ${successCount} questions...`);
        }
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount} questions`);
    console.log(`❌ Failed: ${errorCount} questions`);
    
    if (errors.length > 0) {
      console.log('\n🔍 Errors:');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.question}: ${err.error}`);
      });
    }

    // Verify the import
    const { data: count, error: countError } = await supabaseAdmin
      .from('question_bank')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'nimcet');

    if (!countError) {
      console.log(`\n📈 Total NIMCET questions in database: ${count || 0}`);
    }

    console.log('\n✨ Import complete!');
  } catch (error) {
    console.error('💥 Fatal error during import:', error);
    process.exit(1);
  }
}

// Run the import
importQuestions();
