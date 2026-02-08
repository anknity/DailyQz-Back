const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase School Exam Service
 * Handles school-specific exams for Class 1-12
 */

class SupabaseSchoolExamService {
  
  /**
   * Create a school exam
   * @param {Object} examData - Exam details
   * @returns {Promise<Object>} Created exam
   */
  async createSchoolExam(examData) {
    const {
      classLevel,
      stream,
      subject,
      chapter,
      topic,
      examType,
      questions,
      questionCount,
      durationMinutes
    } = examData;

    const { data, error } = await supabaseAdmin
      .from('school_exams')
      .insert({
        class_level: classLevel,
        stream,
        subject,
        chapter,
        topic,
        exam_type: examType || 'practice',
        questions: JSON.stringify(questions || []),
        question_count: questionCount || 10,
        duration_minutes: durationMinutes || 30
      })
      .select()
      .single();

    if (error) throw error;
    return this.parseExam(data);
  }

  /**
   * Get school exams with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of school exams
   */
  async getSchoolExams(filters = {}) {
    let query = supabaseAdmin.from('school_exams').select('*');

    if (filters.classLevel) {
      query = query.eq('class_level', filters.classLevel);
    }
    if (filters.stream) {
      query = query.eq('stream', filters.stream);
    }
    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }
    if (filters.chapter) {
      query = query.eq('chapter', filters.chapter);
    }
    if (filters.topic) {
      query = query.eq('topic', filters.topic);
    }
    if (filters.examType) {
      query = query.eq('exam_type', filters.examType);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data.map(e => this.parseExam(e));
  }

  /**
   * Get exams by class level
   * @param {string} classLevel - Class level (1-12)
   * @returns {Promise<Array>} Exams for the class
   */
  async getExamsByClass(classLevel) {
    return this.getSchoolExams({ classLevel });
  }

  /**
   * Get exams by subject
   * @param {string} classLevel - Class level
   * @param {string} subject - Subject name
   * @returns {Promise<Array>} Exams for subject
   */
  async getExamsBySubject(classLevel, subject) {
    return this.getSchoolExams({ classLevel, subject });
  }

  /**
   * Get exam by ID
   * @param {string} examId - Exam ID
   * @returns {Promise<Object>} Exam details
   */
  async getSchoolExamById(examId) {
    const { data, error } = await supabaseAdmin
      .from('school_exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (error) throw error;
    return this.parseExam(data);
  }

  /**
   * Update school exam
   * @param {string} examId - Exam ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated exam
   */
  async updateSchoolExam(examId, updates) {
    const updateData = { ...updates };
    
    if (updates.questions) {
      updateData.questions = JSON.stringify(updates.questions);
    }

    const { data, error } = await supabaseAdmin
      .from('school_exams')
      .update(updateData)
      .eq('id', examId)
      .select()
      .single();

    if (error) throw error;
    return this.parseExam(data);
  }

  /**
   * Delete school exam
   * @param {string} examId - Exam ID
   * @returns {Promise<void>}
   */
  async deleteSchoolExam(examId) {
    const { error } = await supabaseAdmin
      .from('school_exams')
      .delete()
      .eq('id', examId);

    if (error) throw error;
  }

  /**
   * Get available subjects for a class
   * @param {string} classLevel - Class level
   * @returns {Promise<Array>} List of subjects
   */
  async getSubjectsForClass(classLevel) {
    const { data, error } = await supabaseAdmin
      .from('school_exams')
      .select('subject')
      .eq('class_level', classLevel);

    if (error) throw error;
    
    // Get unique subjects
    const subjects = [...new Set(data.map(d => d.subject))];
    return subjects.sort();
  }

  /**
   * Get available chapters for a subject
   * @param {string} classLevel - Class level
   * @param {string} subject - Subject name
   * @returns {Promise<Array>} List of chapters
   */
  async getChaptersForSubject(classLevel, subject) {
    const { data, error } = await supabaseAdmin
      .from('school_exams')
      .select('chapter')
      .eq('class_level', classLevel)
      .eq('subject', subject);

    if (error) throw error;
    
    // Get unique chapters
    const chapters = [...new Set(data.map(d => d.chapter).filter(Boolean))];
    return chapters.sort();
  }

  /**
   * Get curriculum structure
   * @returns {Promise<Object>} Curriculum organized by class
   */
  async getCurriculumStructure() {
    const { data, error } = await supabaseAdmin
      .from('school_exams')
      .select('class_level, stream, subject, chapter, topic');

    if (error) throw error;

    // Organize by class
    const curriculum = {};
    for (const exam of data || []) {
      const classKey = exam.class_level;
      if (!curriculum[classKey]) {
        curriculum[classKey] = {
          streams: new Set(),
          subjects: {}
        };
      }

      if (exam.stream) {
        curriculum[classKey].streams.add(exam.stream);
      }

      if (!curriculum[classKey].subjects[exam.subject]) {
        curriculum[classKey].subjects[exam.subject] = {
          chapters: new Set(),
          topics: new Set()
        };
      }

      if (exam.chapter) {
        curriculum[classKey].subjects[exam.subject].chapters.add(exam.chapter);
      }
      if (exam.topic) {
        curriculum[classKey].subjects[exam.subject].topics.add(exam.topic);
      }
    }

    // Convert Sets to Arrays
    Object.keys(curriculum).forEach(classKey => {
      curriculum[classKey].streams = [...curriculum[classKey].streams];
      Object.keys(curriculum[classKey].subjects).forEach(subject => {
        curriculum[classKey].subjects[subject].chapters = 
          [...curriculum[classKey].subjects[subject].chapters];
        curriculum[classKey].subjects[subject].topics = 
          [...curriculum[classKey].subjects[subject].topics];
      });
    });

    return curriculum;
  }

  /**
   * Parse exam data
   * @param {Object} exam - Raw exam data
   * @returns {Object} Parsed exam
   */
  parseExam(exam) {
    if (!exam) return null;
    return {
      ...exam,
      questions: typeof exam.questions === 'string' 
        ? JSON.parse(exam.questions) 
        : exam.questions
    };
  }
}

module.exports = new SupabaseSchoolExamService();
