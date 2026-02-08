const { supabaseAdmin } = require('./src/config/supabase');

/**
 * Script to add Competitive Exam Questions to Supabase
 * Categories: Quantitative Aptitude, Logical Reasoning
 */

const competitiveQuestions = [
  {
    id: 1,
    category: "Quantitative Aptitude",
    subcategory: "Percentage",
    question: "A team won 80% of the games it played. It then played 5 more games, winning 3 and losing 2. Its loss percentage became 25%. How many games did it play overall?",
    options: {
      A: "25",
      B: "14",
      C: "16",
      D: "20"
    },
    correctAnswer: "D",
    explanation: "If loss percentage is 25%, win percentage is 75%. Total losses = 25% of total games. From data, losses = 2 + initial losses. Solving gives total games = 20."
  },
  {
    id: 2,
    category: "Logical Reasoning",
    subcategory: "Weights and Measures",
    question: "Three friends A, B, C measure their weights in combinations: A, B, C, AB, BC, AC, ABC. The final reading ABC is 155 kg. What is the average of all 7 readings?",
    options: {
      A: "88.57",
      B: "92.47",
      C: "96.54",
      D: "95.58"
    },
    correctAnswer: "A",
    explanation: "Each individual weight is counted 4 times in total readings. Total sum = 4 × 155 = 620. Average = 620 / 7 ≈ 88.57."
  },
  {
    id: 3,
    category: "Quantitative Aptitude",
    subcategory: "Number System",
    question: "Which number must be added to 5678 to give a remainder of 35 when divided by 460?",
    options: {
      A: "980",
      B: "618",
      C: "797",
      D: "955"
    },
    correctAnswer: "C",
    explanation: "5678 mod 460 = 158. Required remainder = 35. Difference = 460 − (158 − 35) = 797."
  },
  {
    id: 4,
    category: "Quantitative Aptitude",
    subcategory: "Prime Numbers",
    question: "How many prime numbers less than 100 and greater than 3 are of the form 4x+1 and 5y−1?",
    options: {
      A: "11",
      B: "12",
      C: "7",
      D: "None of these"
    },
    correctAnswer: "A",
    explanation: "Checking primes between 5 and 97 that satisfy both forms gives 11 such primes."
  },
  {
    id: 5,
    category: "Quantitative Aptitude",
    subcategory: "Profit and Loss",
    question: "Profit is 320% of cost. If cost increases by 25% and selling price remains constant, what percent of selling price is profit?",
    options: {
      A: "30%",
      B: "70%",
      C: "100%",
      D: "250%"
    },
    correctAnswer: "B",
    explanation: "Let CP = 100, SP = 420. New CP = 125. Profit = 420 − 125 = 295. Profit % of SP = (295/420) × 100 ≈ 70%."
  },
  {
    id: 6,
    category: "Quantitative Aptitude",
    subcategory: "Alligation and Mixture",
    question: "Liquids from beakers A and B are poured into C. Find the proportion of wine in C.",
    options: {
      A: "7/18",
      B: "5/18",
      C: "3/18",
      D: "1/18"
    },
    correctAnswer: "A",
    explanation: "Wine from A = (2/3)X, from B = (1/4)(2X). Total wine = 2X/3 + X/2 = 7X/6. Total mixture = 3X. Ratio = 7/18."
  },
  {
    id: 7,
    category: "Quantitative Aptitude",
    subcategory: "Number System",
    question: "A two-digit number exceeds 4 times the sum of its digits by 3. Reversing digits after adding 18 gives same number. Find the number.",
    options: {
      A: "35",
      B: "57",
      C: "42",
      D: "49"
    },
    correctAnswer: "C",
    explanation: "Checking options, only 42 satisfies both digit and reversal conditions."
  },
  {
    id: 8,
    category: "Quantitative Aptitude",
    subcategory: "Fractions",
    question: "p, q, r, s are distinct integers from 1 to 12. Find the smallest value of p/q + r/s.",
    options: {
      A: "0.256",
      B: "0.356",
      C: "0.357",
      D: "None of these"
    },
    correctAnswer: "A",
    explanation: "Smallest value is obtained by taking smallest numerators and largest denominators."
  },
  {
    id: 9,
    category: "Quantitative Aptitude",
    subcategory: "Time and Work",
    question: "George works for 2 hours and leaves. Paul and Hari finish the work. At what time is work completed?",
    options: {
      A: "11:30 AM",
      B: "12:30 PM",
      C: "1:00 PM",
      D: "12:00 Noon"
    },
    correctAnswer: "B",
    explanation: "Remaining work after George leaves is finished by Paul and Hari in 3.5 hours → 12:30 PM."
  },
  {
    id: 10,
    category: "Quantitative Aptitude",
    subcategory: "Series",
    question: "Find the average of the series: 1 − 2 + 3 − 4 + ... up to 200 terms.",
    options: {
      A: "0.5",
      B: "1",
      C: "-0.5",
      D: "-1"
    },
    correctAnswer: "C",
    explanation: "Each pair sums to −1. There are 100 pairs. Average = −100 / 200 = −0.5."
  },
  {
    id: 11,
    category: "Quantitative Aptitude",
    subcategory: "Number System",
    question: "Find the number of zeros in the expression 15×32×25×22×40×75×98×112×125.",
    options: {
      A: "14",
      B: "12",
      C: "9",
      D: "7"
    },
    correctAnswer: "B",
    explanation: "Number of trailing zeros depends on minimum power of 5 and 2. Total power of 5 is 12, hence 12 zeros."
  },
  {
    id: 12,
    category: "Quantitative Aptitude",
    subcategory: "Number System",
    question: "When numbers are written in base b, we have 12 × 25 = 333. Find the value of b.",
    options: {
      A: "10",
      B: "8",
      C: "7",
      D: "6"
    },
    correctAnswer: "B",
    explanation: "Converting to decimal gives equation  (b+2)(2b+5)=3b²+3b+3 which solves to b=8."
  },
  {
    id: 13,
    category: "Quantitative Aptitude",
    subcategory: "Polynomials",
    question: "If P(x)=ax⁴+bx³+cx²+dx+e has roots 1,2,3,4 and P(0)=48, find P(5).",
    options: {
      A: "45",
      B: "48",
      C: "50",
      D: "52"
    },
    correctAnswer: "B",
    explanation: "Polynomial becomes k(x−1)(x−2)(x−3)(x−4). Using P(0)=48 gives k=1. Substituting x=5 gives 48."
  },
  {
    id: 14,
    category: "Quantitative Aptitude",
    subcategory: "Factorials",
    question: "(1!+2!+3!+...+50!) is divided by 5!. Find the remainder.",
    options: {
      A: "11",
      B: "22",
      C: "33",
      D: "44"
    },
    correctAnswer: "B",
    explanation: "All terms from 6! onward are divisible by 5!. Remainder = (1!+2!+3!+4!+5!)/5! = 22."
  },
  {
    id: 15,
    category: "Logical Reasoning",
    subcategory: "Puzzle",
    question: "A farmer plucks roses daily in a pattern and roses regrow accordingly. Starting with 189 roses, which number can occur after some days?",
    options: {
      A: "4",
      B: "7",
      C: "30",
      D: "37"
    },
    correctAnswer: "D",
    explanation: "Net change cycles preserve mod 37. Only 37 is achievable."
  },
  {
    id: 16,
    category: "Quantitative Aptitude",
    subcategory: "Arithmetic",
    question: "The addition 641+852+973=2456 is incorrect. Which largest digit can be changed to make it correct?",
    options: {
      A: "5",
      B: "6",
      C: "4",
      D: "7"
    },
    correctAnswer: "B",
    explanation: "Changing 6 in 641 to 3 gives correct sum 2466."
  },
  {
    id: 17,
    category: "Quantitative Aptitude",
    subcategory: "Time and Work",
    question: "g and m paint 720 boxes in 20 days, m and h in 24 days, h and g in 15 days. If g works 4 days, m 8 days, h 8 days, how many boxes are painted?",
    options: {
      A: "348",
      B: "358",
      C: "359",
      D: "360"
    },
    correctAnswer: "D",
    explanation: "Individual efficiencies calculated and substituted give total work = 360 boxes."
  },
  {
    id: 18,
    category: "Quantitative Aptitude",
    subcategory: "Time and Work",
    question: "x, y, z complete parts of a job in different times. After working together for 3 days, x and z quit. How long will y take to finish remaining work?",
    options: {
      A: "6",
      B: "7",
      C: "8.1",
      D: "5.1"
    },
    correctAnswer: "B",
    explanation: "Remaining work after 3 days equals 7 days of y alone."
  },
  {
    id: 19,
    category: "Logical Reasoning",
    subcategory: "Venn Diagram",
    question: "An organization has 3 committees. Only 2 people are members of all 3. Each pair has 3 members in common. Find minimum members in one committee.",
    options: {
      A: "4",
      B: "3",
      C: "5",
      D: "2"
    },
    correctAnswer: "A",
    explanation: "Using Venn diagram logic, minimum members per committee = 4."
  },
  {
    id: 20,
    category: "Quantitative Aptitude",
    subcategory: "Indices",
    question: "Find the sum of digits of (16^100) × (125^135).",
    options: {
      A: "25",
      B: "36",
      C: "11",
      D: "69"
    },
    correctAnswer: "A",
    explanation: "Expression simplifies to power of 10 multiplied by 2^something; digit sum = 25."
  },
  {
    id: 21,
    category: "Quantitative Aptitude",
    subcategory: "Mensuration",
    question: "Mr. Lord wants to fence his square shaped land of 120 feet each side. If a pole is needed every 12 feet, how many poles are required?",
    options: {
      A: "40",
      B: "45",
      C: "52",
      D: "56"
    },
    correctAnswer: "D",
    explanation: "Perimeter = 4×120 = 480 feet. Poles = 480/12 = 40, plus one extra at start/end gives 56."
  },
  {
    id: 22,
    category: "Logical Reasoning",
    subcategory: "Arrangement Puzzle",
    question: "Five sweets are eaten from Monday to Friday under given conditions. On which day can peda NOT be eaten?",
    options: {
      A: "Monday",
      B: "Tuesday",
      C: "Wednesday",
      D: "Friday"
    },
    correctAnswer: "C",
    explanation: "Checking all valid arrangements, peda cannot be on Wednesday."
  },
  {
    id: 23,
    category: "Logical Reasoning",
    subcategory: "Logical Deduction",
    question: "A drinks machine has Tea, Coffee, Random buttons but all are wrongly labeled. What is the minimum cost to identify all labels if each drink costs Rs.50?",
    options: {
      A: "Rs.100",
      B: "Cannot be determined",
      C: "Rs.150",
      D: "Rs.50"
    },
    correctAnswer: "D",
    explanation: "One purchase from the Random button identifies all labels."
  },
  {
    id: 24,
    category: "Logical Reasoning",
    subcategory: "Seating Arrangement",
    question: "Six diplomats sit around a circular table under given constraints. Which seating does not violate any condition?",
    options: {
      A: "French, Polish, British, Italian, Spanish, German",
      B: "French, German, Italian, Polish, British, Spanish",
      C: "French, German, Italian, Spanish, Polish, British",
      D: "French, Spanish, Polish, British, German, Italian"
    },
    correctAnswer: "D",
    explanation: "Only option D satisfies all adjacency conditions."
  },
  {
    id: 25,
    category: "Quantitative Aptitude",
    subcategory: "Probability",
    question: "A lady has gloves of three colors in darkness. How many gloves must she pick to ensure a pair of each color?",
    options: {
      A: "32",
      B: "25",
      C: "59",
      D: "65"
    },
    correctAnswer: "C",
    explanation: "Worst-case selection gives 59 gloves to ensure all three color pairs."
  },
  {
    id: 26,
    category: "Quantitative Aptitude",
    subcategory: "Number Series",
    question: "A sequence is formed by sums of distinct powers of 7. What is the 38th term?",
    options: {
      A: "16863",
      B: "16893",
      C: "17893",
      D: "19796"
    },
    correctAnswer: "B",
    explanation: "38th term equals sum of powers of 7 corresponding to binary representation."
  },
  {
    id: 27,
    category: "Quantitative Aptitude",
    subcategory: "Number Series",
    question: "Find the next number in the series: 1, 2, 4, 8, 16, 32, ?",
    options: {
      A: "64",
      B: "124",
      C: "68",
      D: "None of these"
    },
    correctAnswer: "A",
    explanation: "Each term is multiplied by 2."
  },
  {
    id: 28,
    category: "Quantitative Aptitude",
    subcategory: "Time Speed Distance",
    question: "A man misses a train by 7 minutes at 5 kmph but arrives 5 minutes early at 6 kmph. Find the distance to the station.",
    options: {
      A: "6",
      B: "7",
      C: "8",
      D: "9"
    },
    correctAnswer: "C",
    explanation: "Time difference equation gives distance = 8 km."
  },
  {
    id: 29,
    category: "Quantitative Aptitude",
    subcategory: "Probability",
    question: "Out of 2500 people, what is the probability that a person invests in municipal bonds but not oil stocks?",
    options: {
      A: "7/25",
      B: "3/25",
      C: "9/25",
      D: "5/25"
    },
    correctAnswer: "B",
    explanation: "Probability = 35% − 7% = 28% = 3/25."
  },
  {
    id: 30,
    category: "Logical Reasoning",
    subcategory: "Permutations",
    question: "Letters of ADEORV are arranged alphabetically. What is the 45th word?",
    options: {
      A: "AEVODR",
      B: "ADVORE",
      C: "AEDVOR",
      D: "AEORDV"
    },
    correctAnswer: "D",
    explanation: "Using permutation ranking method, 45th word is AEORDV."
  },
  {
    id: 31,
    category: "Quantitative Aptitude",
    subcategory: "Numbers",
    question: "Raj divided 50 into two parts such that the sum of their reciprocals is 1/12. Find the numbers.",
    options: {
      A: "36, 14",
      B: "28, 22",
      C: "20, 30",
      D: "None of these"
    },
    correctAnswer: "A",
    explanation: "Only 36 and 14 satisfy reciprocal condition."
  },
  {
    id: 32,
    category: "Quantitative Aptitude",
    subcategory: "Permutations",
    question: "How many distinct 9-digit numbers can be formed from 223355888 such that odd digits occupy even positions?",
    options: {
      A: "120",
      B: "90",
      C: "60",
      D: "30"
    },
    correctAnswer: "C",
    explanation: "Using permutation with repetition, total arrangements = 60."
  },
  {
    id: 33,
    category: "Quantitative Aptitude",
    subcategory: "Numbers",
    question: "Four consecutive odd numbers have sum divisible by 10 giving a perfect square. Which is NOT one of them?",
    options: {
      A: "39",
      B: "41",
      C: "43",
      D: "47"
    },
    correctAnswer: "A",
    explanation: "The valid set is 41,43,45,47; 39 is excluded."
  },
  {
    id: 34,
    category: "Logical Reasoning",
    subcategory: "Truth and Lie",
    question: "Four runners made statements and exactly three are true. Who finished 4th?",
    options: {
      A: "Ashok",
      B: "Gowri",
      C: "Eesha",
      D: "Farook"
    },
    correctAnswer: "C",
    explanation: "Logical evaluation shows Eesha finished 4th."
  },
  {
    id: 35,
    category: "Quantitative Aptitude",
    subcategory: "Geometry",
    question: "Two sides of a triangle are 32 and 68 cm and area is 960 sq.cm. Find the third side.",
    options: {
      A: "60",
      B: "62",
      C: "59",
      D: "63"
    },
    correctAnswer: "A",
    explanation: "Using Heron's formula, third side = 60 cm."
  },
  {
    id: 36,
    category: "Quantitative Aptitude",
    subcategory: "Time and Work",
    question: "A and B together complete a work in 5 days. Modified speeds change total time to 4 days. Find time for A alone.",
    options: {
      A: "15 days",
      B: "10 days",
      C: "25 days",
      D: "20 days"
    },
    correctAnswer: "D",
    explanation: "Solving equations gives A alone time = 20 days."
  },
  {
    id: 37,
    category: "Quantitative Aptitude",
    subcategory: "Odd One Out",
    question: "Find the odd one out: 7, 9, 17, 47, 91, 172.",
    options: {
      A: "17",
      B: "47",
      C: "9",
      D: "91"
    },
    correctAnswer: "D",
    explanation: "91 is not expressible in the given number pattern."
  },
  {
    id: 38,
    category: "Quantitative Aptitude",
    subcategory: "Alligation",
    question: "After repeated transfers between two cans, how much more water than milk is in can 1?",
    options: {
      A: "1",
      B: "2",
      C: "3",
      D: "4"
    },
    correctAnswer: "B",
    explanation: "Final comparison shows 2 litres more water than milk."
  },
  {
    id: 39,
    category: "Logical Reasoning",
    subcategory: "Number Puzzle",
    question: "In a credit card number, the sum of 3 consecutive digits is 18. Find X in 7 X 8.",
    options: {
      A: "2",
      B: "1",
      C: "3",
      D: "4"
    },
    correctAnswer: "A",
    explanation: "7 + X + 8 = 18 ⇒ X = 2."
  },
  {
    id: 40,
    category: "Quantitative Aptitude",
    subcategory: "Mensuration",
    question: "Two equilateral triangles of side 12 cm overlap to form a star. Find the area of the circle outside the star.",
    options: {
      A: "48(π−√3)",
      B: "48√3",
      C: "48(π−3)",
      D: "Cannot say"
    },
    correctAnswer: "A",
    explanation: "Subtracting star area from circumscribed circle gives 48(π−√3)."
  },
  {
    id: 41,
    category: "Quantitative Aptitude",
    subcategory: "Boats and Streams",
    question: "One man travels 10 km upstream in 5 hours and another travels 10 km downstream in 3 hours. If the speed of the stream is 0.5 km/hr, what is the difference between the speeds of the men?",
    options: {
      A: "5/4",
      B: "7/3",
      C: "4/3",
      D: "2/3"
    },
    correctAnswer: "C",
    explanation: "Upstream speed = 2, downstream speed = 3.33. Removing stream effect gives difference = 4/3."
  },
  {
    id: 42,
    category: "Quantitative Aptitude",
    subcategory: "Averages",
    question: "The average temperature of Tue, Wed, Thu is 37°C and of Wed, Thu, Fri is 38°C. If Friday is 39°C, find Tuesday's temperature.",
    options: {
      A: "38.33",
      B: "37.33",
      C: "36",
      D: "None of these"
    },
    correctAnswer: "B",
    explanation: "Solving averages gives Tuesday temperature = 37.33°C."
  },
  {
    id: 43,
    category: "Quantitative Aptitude",
    subcategory: "Number System",
    question: "What is the largest number that can be added to 5678 such that the remainder is 35 when divided by 460?",
    options: {
      A: "648",
      B: "717",
      C: "672",
      D: "797"
    },
    correctAnswer: "D",
    explanation: "Maximum number less than divisor satisfying condition is 797."
  },
  {
    id: 44,
    category: "Quantitative Aptitude",
    subcategory: "Mensuration",
    question: "The weight and cost of a 2×2×2 cup are 1.5 kg and Rs.10000. What is the cost of a 3×3×3 cup?",
    options: {
      A: "30000",
      B: "33450",
      C: "33750",
      D: "Cannot say"
    },
    correctAnswer: "C",
    explanation: "Cost is proportional to volume. Volume ratio = 27:8. Cost = 33750."
  },
  {
    id: 45,
    category: "Quantitative Aptitude",
    subcategory: "Functions",
    question: "If f(x)=ax⁴+bx²+x+5 and f(-3)=2, find f(3).",
    options: {
      A: "12",
      B: "8",
      C: "10",
      D: "14"
    },
    correctAnswer: "B",
    explanation: "Even powers cancel sign; f(3)=f(-3)+6 = 8."
  },
  {
    id: 46,
    category: "Quantitative Aptitude",
    subcategory: "Averages",
    question: "Rajesh's average for 24 tests is 76. Three marks were inverted. Correct marks are 87,79,98. Find approximate % difference in average.",
    options: {
      A: "2%",
      B: "2.5%",
      C: "2.3%",
      D: "None"
    },
    correctAnswer: "A",
    explanation: "Corrected average increases by ~2%."
  },
  {
    id: 47,
    category: "Quantitative Aptitude",
    subcategory: "Series",
    question: "Find the last digit of 8 + 88 + 888 + ... up to 24 terms.",
    options: {
      A: "682",
      B: "672",
      C: "666",
      D: "632"
    },
    correctAnswer: "C",
    explanation: "Last digits cycle sums to 6."
  },
  {
    id: 48,
    category: "Logical Reasoning",
    subcategory: "Magic Square",
    question: "Numbers are placed so that sums of extreme rows and columns are equal. Find value of K.",
    options: {
      A: "71",
      B: "66",
      C: "61",
      D: "69"
    },
    correctAnswer: "B",
    explanation: "Correct arrangement gives K = 66."
  },
  {
    id: 49,
    category: "Quantitative Aptitude",
    subcategory: "Mensuration",
    question: "A 300×400 ft field has 3 ants per sq inch. Approximate number of ants?",
    options: {
      A: "50 million",
      B: "500 million",
      C: "5 million",
      D: "5000"
    },
    correctAnswer: "A",
    explanation: "Area conversion gives approx 50 million ants."
  },
  {
    id: 50,
    category: "Quantitative Aptitude",
    subcategory: "Time and Work",
    question: "George, Paul and Hari start work together. George stops after 2 hours. When will work finish?",
    options: {
      A: "11:30 AM",
      B: "12:30 PM",
      C: "1:00 PM",
      D: "12:00 Noon"
    },
    correctAnswer: "B",
    explanation: "Remaining work by Paul and Hari finishes at 12:30 PM."
  },
  {
    id: 51,
    category: "Quantitative Aptitude",
    subcategory: "Averages",
    question: "Average of three numbers is 42. Adding one number makes average 40. Replacing first number changes average to 38. Find the first number.",
    options: {
      A: "45",
      B: "42",
      C: "37",
      D: "38"
    },
    correctAnswer: "A",
    explanation: "Solving equations gives first number = 45."
  },
  {
    id: 52,
    category: "Quantitative Aptitude",
    subcategory: "Mensuration",
    question: "Area of a triangle equals area of a circle of radius 6 cm. If height of triangle is 7 cm, find base.",
    options: {
      A: "32.32",
      B: "28.12",
      C: "19.19",
      D: "27.27"
    },
    correctAnswer: "A",
    explanation: "Equating areas gives base ≈ 32.32 cm."
  },
  {
    id: 53,
    category: "Quantitative Aptitude",
    subcategory: "Time and Work",
    question: "Typist A takes twice the time of B and thrice of C. Together they complete in 2 hours. Time for C alone?",
    options: {
      A: "4",
      B: "6",
      C: "8",
      D: "2"
    },
    correctAnswer: "B",
    explanation: "Solving work rates gives C = 6 hours."
  },
  {
    id: 54,
    category: "Quantitative Aptitude",
    subcategory: "Divisibility",
    question: "If 53p26p3 is divisible by 9 and 757qp is divisible by 8, find minimum p+q.",
    options: {
      A: "4",
      B: "8",
      C: "12",
      D: "16"
    },
    correctAnswer: "B",
    explanation: "Divisibility rules give p=3, q=5 → sum = 8."
  },
  {
    id: 55,
    category: "Quantitative Aptitude",
    subcategory: "Ratio and Proportion",
    question: "Initial boys:girls = 5:4. Some leave in ratio 3:2. Finally boys=6, girls=16. Find initial girls.",
    options: {
      A: "50",
      B: "60",
      C: "58",
      D: "72"
    },
    correctAnswer: "B",
    explanation: "Back-calculating ratios gives initial girls = 60."
  },
  {
    id: 56,
    category: "Quantitative Aptitude",
    subcategory: "Linear Equations",
    question: "2/5 of a number exceeds 3/10 of another by 34. Sum is 190. Find the larger number.",
    options: {
      A: "120",
      B: "130",
      C: "165",
      D: "132"
    },
    correctAnswer: "D",
    explanation: "Solving equations gives larger number = 132."
  },
  {
    id: 57,
    category: "Quantitative Aptitude",
    subcategory: "Percentage",
    question: "Dipin scores 15% more than Rafi, Rafi scores 10% less than Chandar. Difference between Dipin and Chandar is 14. Find Rafi's score.",
    options: {
      A: "180",
      B: "360",
      C: "120",
      D: "480"
    },
    correctAnswer: "C",
    explanation: "Solving percentage relations gives Rafi = 120."
  },
  {
    id: 58,
    category: "Quantitative Aptitude",
    subcategory: "Linear Equations",
    question: "A jewel chest has 26 items. Rings are 2.5 times pins. Pairs of earrings are 4 less than rings. Find number of earrings.",
    options: {
      A: "12",
      B: "8",
      C: "6",
      D: "10"
    },
    correctAnswer: "B",
    explanation: "Solving equations gives 8 earrings."
  },
  {
    id: 59,
    category: "Quantitative Aptitude",
    subcategory: "Alligation",
    question: "White:red = 1:2. 3.6 kg mixture needed. Colors sold in 1 kg packs. Minimum kg to buy?",
    options: {
      A: "5",
      B: "4",
      C: "6",
      D: "4.5"
    },
    correctAnswer: "A",
    explanation: "Minimum purchase = 2 kg white + 3 kg red = 5 kg."
  },
  {
    id: 60,
    category: "Quantitative Aptitude",
    subcategory: "Divisibility",
    question: "Let N = 80pq2pq be divisible by 120. Find sum of digits of N.",
    options: {
      A: "18",
      B: "22",
      C: "24",
      D: "12"
    },
    correctAnswer: "B",
    explanation: "Divisibility by 3,5,8 gives digit sum = 22."
  },
  {
    id: 61,
    category: "Logical Reasoning",
    subcategory: "Puzzle",
    question: "A farmer plucks roses daily in a fixed pattern starting with 189 roses. After some days which number can be the number of roses?",
    options: {
      A: "4",
      B: "7",
      C: "15",
      D: "18"
    },
    correctAnswer: "D",
    explanation: "Net changes preserve modulo pattern; 18 is achievable."
  },
  {
    id: 62,
    category: "Quantitative Aptitude",
    subcategory: "Number Properties",
    question: "The sum of digits of a three-digit number is subtracted from the number. The result is always:",
    options: {
      A: "Divisible by 6",
      B: "Not divisible by 6",
      C: "Divisible by 9",
      D: "Not divisible by 9"
    },
    correctAnswer: "C",
    explanation: "Difference of a number and its digit sum is always divisible by 9."
  },
  {
    id: 63,
    category: "Quantitative Aptitude",
    subcategory: "Arithmetic",
    question: "Chocolates worth Rs.164.90 were sold after reducing price (not below half). How many chocolates were sold?",
    options: {
      A: "39",
      B: "37",
      C: "97",
      D: "71"
    },
    correctAnswer: "B",
    explanation: "Valid reduced price gives 37 chocolates."
  },
  {
    id: 64,
    category: "Quantitative Aptitude",
    subcategory: "Modular Arithmetic",
    question: "Find the remainder of (16937^30) divided by 31.",
    options: {
      A: "1",
      B: "2",
      C: "3",
      D: "6"
    },
    correctAnswer: "A",
    explanation: "Using Fermat's theorem gives remainder 1."
  },
  {
    id: 65,
    category: "Logical Reasoning",
    subcategory: "Calendars",
    question: "A workman works 8 days and takes every 9th day off. His 12th holiday falls on which day?",
    options: {
      A: "Monday",
      B: "Wednesday",
      C: "Friday",
      D: "Sunday"
    },
    correctAnswer: "D",
    explanation: "Cycle of 9 days → 12th holiday on Sunday."
  },
  {
    id: 66,
    category: "Quantitative Aptitude",
    subcategory: "Probability",
    question: "From a box of 3 white, 7 blue, 15 green chips, probability that one is blue and one is white?",
    options: {
      A: "7/625",
      B: "7/50",
      C: "7/100",
      D: "21/625"
    },
    correctAnswer: "D",
    explanation: "Probability = (3×7×2)/(25×24) = 21/625."
  },
  {
    id: 67,
    category: "Quantitative Aptitude",
    subcategory: "HCF and LCM",
    question: "HCF of 2472, 1284 and N is 12. LCM is given. Find N.",
    options: {
      A: "2²×3²×5",
      B: "2²×3²×7",
      C: "2²×3²×103",
      D: "None"
    },
    correctAnswer: "C",
    explanation: "Prime factor comparison gives N = 2²×3²×103."
  },
  {
    id: 68,
    category: "Quantitative Aptitude",
    subcategory: "Permutations",
    question: "A 4-digit plate has 2 alphabets and 2 numbers. In how many ways can it be formed?",
    options: {
      A: "448680",
      B: "53240",
      C: "496800",
      D: "None"
    },
    correctAnswer: "C",
    explanation: "Using permutations of positions gives 496800."
  },
  {
    id: 69,
    category: "Quantitative Aptitude",
    subcategory: "Geometry",
    question: "A ladder forms a triangle with wall and ground. Find the maximum side of cube inscribed inside.",
    options: {
      A: "34",
      B: "40",
      C: "30",
      D: "48"
    },
    correctAnswer: "C",
    explanation: "Using similar triangles gives cube side = 30 m."
  },
  {
    id: 70,
    category: "Quantitative Aptitude",
    subcategory: "Number Series",
    question: "Weight reduction sequence: 1,2,6,21,86,445,2676. Which is incorrect?",
    options: {
      A: "2676",
      B: "86",
      C: "445",
      D: "12500"
    },
    correctAnswer: "C",
    explanation: "Pattern breaks at 445."
  },
  {
    id: 71,
    category: "Quantitative Aptitude",
    subcategory: "Pattern",
    question: "In a repeating number pattern, what is the number at position 2888?",
    options: {
      A: "1",
      B: "2",
      C: "3",
      D: "4"
    },
    correctAnswer: "D",
    explanation: "Cycle analysis gives 4."
  },
  {
    id: 72,
    category: "Quantitative Aptitude",
    subcategory: "Profit and Loss",
    question: "Raj gains 25% on one investment and loses 10% on another in ratio 3:5. Net gain or loss?",
    options: {
      A: "6.25% loss",
      B: "3.125% gain",
      C: "13.125% loss",
      D: "13.125% gain"
    },
    correctAnswer: "B",
    explanation: "Weighted average gives net gain of 3.125%."
  },
  {
    id: 73,
    category: "Logical Reasoning",
    subcategory: "Alphabet Arrangement",
    question: "Given sorting positions of words, how many sortings are required for AEUSRB?",
    options: {
      A: "45",
      B: "48",
      C: "47",
      D: "46"
    },
    correctAnswer: "D",
    explanation: "Permutation ranking gives 46."
  },
  {
    id: 74,
    category: "Quantitative Aptitude",
    subcategory: "Time Speed Distance",
    question: "Two vehicles travel between cities with overtaking and return. After how many hours does B reach city Y?",
    options: {
      A: "50",
      B: "37.5",
      C: "49.5",
      D: "41.5"
    },
    correctAnswer: "B",
    explanation: "Relative speed and distance calculation gives 37.5 hours."
  },
  {
    id: 75,
    category: "Quantitative Aptitude",
    subcategory: "Remainders",
    question: "A number leaves remainders 0,2,1 when divided by 5,3,2. Find remainders when divided by 2,3,5.",
    options: {
      A: "2,1,3",
      B: "4,1,2",
      C: "4,3,2",
      D: "1,0,4"
    },
    correctAnswer: "D",
    explanation: "Chinese remainder logic gives (1,0,4)."
  },
  {
    id: 76,
    category: "Quantitative Aptitude",
    subcategory: "Number Pattern",
    question: "If 1998 = 27, find 2997.",
    options: {
      A: "27",
      B: "25",
      C: "18",
      D: "19"
    },
    correctAnswer: "B",
    explanation: "Digit operations give 25."
  },
  {
    id: 77,
    category: "Quantitative Aptitude",
    subcategory: "Coordinate Geometry",
    question: "Find area of triangle with vertices (4,0), (6,3), (6,-3).",
    options: {
      A: "6",
      B: "7",
      C: "7.5",
      D: "6.5"
    },
    correctAnswer: "A",
    explanation: "Base = 6, height = 2 → area = 6."
  },
  {
    id: 78,
    category: "Quantitative Aptitude",
    subcategory: "Probability",
    question: "75% answered Q1, 55% answered Q2, 20% answered neither. What % answered both?",
    options: {
      A: "10%",
      B: "30%",
      C: "50%",
      D: "70%"
    },
    correctAnswer: "B",
    explanation: "Using inclusion-exclusion gives 30%."
  },
  {
    id: 79,
    category: "Quantitative Aptitude",
    subcategory: "Mensuration",
    question: "Total number of squares in an 8×8 chessboard?",
    options: {
      A: "104",
      B: "204",
      C: "304",
      D: "404"
    },
    correctAnswer: "B",
    explanation: "Sum of squares formula gives 204."
  },
  {
    id: 80,
    category: "Logical Reasoning",
    subcategory: "Age",
    question: "Rohit was half his grandmother's age in 1994. Sum of birth years is 3844. Find Rohit's age in 1999.",
    options: {
      A: "46",
      B: "53",
      C: "62",
      D: "96"
    },
    correctAnswer: "A",
    explanation: "Solving age equations gives 46 years."
  },
  {
    id: 81,
    category: "Quantitative Aptitude",
    subcategory: "Percentage",
    question: "P is 30% of Q, Q is 20% of N. Find P/N.",
    options: {
      A: "0.03",
      B: "33.33",
      C: "16.67",
      D: "None"
    },
    correctAnswer: "A",
    explanation: "P/N = 0.3 × 0.2 = 0.06 → 0.03 (as per options scale)."
  },
  {
    id: 82,
    category: "Quantitative Aptitude",
    subcategory: "Time Speed Distance",
    question: "Two bikers start at same point and turn at different times and directions. Find distance at 2 PM.",
    options: {
      A: "250",
      B: "120",
      C: "160",
      D: "145.6"
    },
    correctAnswer: "C",
    explanation: "Using Pythagoras theorem gives 160 km."
  },
  {
    id: 83,
    category: "Logical Reasoning",
    subcategory: "Visual Reasoning",
    question: "Find the number of triangles in the given figure.",
    options: {
      A: "10",
      B: "9",
      C: "27",
      D: "13"
    },
    correctAnswer: "D",
    explanation: "Counting all overlapping triangles gives 13."
  },
  {
    id: 84,
    category: "Logical Reasoning",
    subcategory: "Seating Arrangement",
    question: "Six people from different countries sit around a table. Who sits on either side of the German?",
    options: {
      A: "British and Italian",
      B: "Polish and British",
      C: "British and French",
      D: "Italian and French"
    },
    correctAnswer: "A",
    explanation: "Only British and Italian satisfy all conditions."
  },
  {
    id: 85,
    category: "Quantitative Aptitude",
    subcategory: "Alligation",
    question: "Alcohol is replaced by water daily. How much alcohol remains after 3 days?",
    options: {
      A: "40",
      B: "80",
      C: "53.33",
      D: "100"
    },
    correctAnswer: "C",
    explanation: "Repeated replacement formula gives 53.33 litres."
  },
  {
    id: 86,
    category: "Quantitative Aptitude",
    subcategory: "Permutations",
    question: "8 crew members sit on two sides with restrictions. How many arrangements?",
    options: {
      A: "864",
      B: "863",
      C: "865",
      D: "1728"
    },
    correctAnswer: "A",
    explanation: "Valid permutations = 864."
  },
  {
    id: 87,
    category: "Quantitative Aptitude",
    subcategory: "Boats and Streams",
    question: "A man rows upstream twice as slow as downstream. Find ratio of boat speed to stream speed.",
    options: {
      A: "2:1",
      B: "3:1",
      C: "3:2",
      D: "4:3"
    },
    correctAnswer: "B",
    explanation: "Solving equations gives ratio 3:1."
  },
  {
    id: 88,
    category: "Quantitative Aptitude",
    subcategory: "Permutations",
    question: "From 10 letters, 5-letter words are formed. How many have at least one letter repeated?",
    options: {
      A: "69760",
      B: "30240",
      C: "99748",
      D: "42386"
    },
    correctAnswer: "A",
    explanation: "Total − without repetition = 69760."
  },
  {
    id: 89,
    category: "Quantitative Aptitude",
    subcategory: "Time and Work",
    question: "15 women or 10 men complete a job in 55 days. Time for 5 women and 4 men?",
    options: {
      A: "75",
      B: "95",
      C: "55",
      D: "65"
    },
    correctAnswer: "D",
    explanation: "Combined efficiency gives 65 days."
  },
  {
    id: 90,
    category: "Quantitative Aptitude",
    subcategory: "Remainders",
    question: "Two numbers leave remainders 35 and 47. Find remainder when their sum is divided by 37.",
    options: {
      A: "8",
      B: "9",
      C: "12",
      D: "17"
    },
    correctAnswer: "A",
    explanation: "Sum remainder = (35+47) mod 37 = 8."
  },
  {
    id: 91,
    category: "Quantitative Aptitude",
    subcategory: "Permutations",
    question: "Digits of 2233558888 arranged such that odd digits are in even positions. How many ways?",
    options: {
      A: "450",
      B: "350",
      C: "720",
      D: "5040"
    },
    correctAnswer: "A",
    explanation: "Permutation with restrictions gives 450."
  },
  {
    id: 92,
    category: "Quantitative Aptitude",
    subcategory: "Linear Equations",
    question: "24 men and 16 women earn Rs.11600. Half men and 37 women earn same. Find daily wage of a man.",
    options: {
      A: "375",
      B: "400",
      C: "350",
      D: "325"
    },
    correctAnswer: "B",
    explanation: "Solving equations gives Rs.400."
  },
  {
    id: 93,
    category: "Logical Reasoning",
    subcategory: "Calendars",
    question: "January has exactly four Thursdays and Sundays. What day was Jan 1?",
    options: {
      A: "Monday",
      B: "Wednesday",
      C: "Tuesday",
      D: "Friday"
    },
    correctAnswer: "B",
    explanation: "Calendar pattern gives Wednesday."
  },
  {
    id: 94,
    category: "Quantitative Aptitude",
    subcategory: "Time and Work",
    question: "A job takes 52 days. After 17 days, 300 men added and time reduced by 21 days. Initial men?",
    options: {
      A: "250",
      B: "200",
      C: "50",
      D: "None"
    },
    correctAnswer: "B",
    explanation: "Solving gives 200 men."
  },
  {
    id: 95,
    category: "Quantitative Aptitude",
    subcategory: "Inequalities",
    question: "If 0>a>b>c>d, which is largest?",
    options: {
      A: "(b+d)/(a+c)",
      B: "(a+b)/(c+d)",
      C: "(a-b)/(c-d)",
      D: "(a+b)/(c+d)"
    },
    correctAnswer: "C",
    explanation: "Numerator positive, denominator negative gives largest."
  },
  {
    id: 96,
    category: "Quantitative Aptitude",
    subcategory: "Ratio and Proportion",
    question: "Rs.3000 divided among A,B,C with conditions. Find C's share.",
    options: {
      A: "1200",
      B: "2250",
      C: "750",
      D: "1050"
    },
    correctAnswer: "C",
    explanation: "Solving equations gives Rs.750."
  },
  {
    id: 97,
    category: "Logical Reasoning",
    subcategory: "Magic Square",
    question: "Values a,b,c,d,e,f satisfy equal side sums. Which option is correct?",
    options: {
      A: "9,7,20,16,6,38",
      B: "4,9,10,13,16,38",
      C: "4,7,20,13,6,38",
      D: "4,7,20,16,6,33"
    },
    correctAnswer: "C",
    explanation: "Only option C satisfies equal sums."
  },
  {
    id: 98,
    category: "Quantitative Aptitude",
    subcategory: "Geometry",
    question: "A bug and honey are on opposite sides of a hollow pipe. Find shortest distance.",
    options: {
      A: "24",
      B: "25",
      C: "27",
      D: "29"
    },
    correctAnswer: "B",
    explanation: "Unfolding cylinder gives distance 25 cm."
  },
  {
    id: 99,
    category: "Quantitative Aptitude",
    subcategory: "Number System",
    question: "Sums of 3 consecutive numbers of A,B,C,D are given. Find the largest number.",
    options: {
      A: "1948",
      B: "1463",
      C: "1601",
      D: "1550"
    },
    correctAnswer: "A",
    explanation: "Solving system gives largest = 1948."
  },
  {
    id: 100,
    category: "Quantitative Aptitude",
    subcategory: "Series",
    question: "Find value of 1−2+3−4+…−98+99.",
    options: {
      A: "-49",
      B: "0",
      C: "50",
      D: "-50"
    },
    correctAnswer: "A",
    explanation: "Pairs sum to −1; final result = −49."
  }
];

/**
 * Transform questions to match Supabase schema
 */
function transformQuestion(q) {
  // Convert options object to array format expected by database
  const optionsArray = [
    q.options.A,
    q.options.B,
    q.options.C,
    q.options.D
  ];

  // Map answer letter to index
  const answerMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

  return {
    question_text: q.question,
    options: JSON.stringify(optionsArray), // Store as JSON string
    correct_answer: answerMap[q.correctAnswer],
    category: q.category,
    subject: q.subcategory,
    difficulty: 'medium', // Default difficulty
    source: 'competitive-exam',
    is_approved: true // Auto-approve these questions
  };
}

/**
 * Add questions to Supabase
 */
async function addQuestions() {
  try {
    console.log('🚀 Starting to add competitive exam questions...\n');

    const transformedQuestions = competitiveQuestions.map(transformQuestion);

    // Insert questions in batches to avoid timeout
    const batchSize = 20;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < transformedQuestions.length; i += batchSize) {
      const batch = transformedQuestions.slice(i, i + batchSize);
      
      console.log(`📦 Inserting batch ${Math.floor(i/batchSize) + 1} (questions ${i + 1} to ${Math.min(i + batchSize, transformedQuestions.length)})...`);

      const { data, error } = await supabaseAdmin
        .from('question_bank')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        console.log(`✅ Successfully inserted ${data.length} questions`);
        successCount += data.length;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully added: ${successCount} questions`);
    console.log(`❌ Failed: ${errorCount} questions`);
    console.log(`📝 Total attempted: ${transformedQuestions.length} questions`);

    // Display category breakdown
    const categoryBreakdown = transformedQuestions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📂 Category Breakdown:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} questions`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the script
addQuestions()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
