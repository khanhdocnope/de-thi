#!/usr/bin/env node

/**
 * TinyFish Agent CLI
 * 
 * Usage:
 *   node server/tinyfish_agent/cli.js test
 *   node server/tinyfish_agent/cli.js list [--subject=math|physics|chemistry] [--grade=10|11|12]
 *   node server/tinyfish_agent/cli.js run --index=0
 *   node server/tinyfish_agent/cli.js batch [--subject=math] [--count=2]
 */

const { runAutomation, searchWeb } = require('./client');
const { CURRICULUM_CATALOG, getTopicsBySubject, getTopicsByGrade, generateLesson } = require('./curriculum_agent');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  console.log(`\n======================================================`);
  console.log(`🤖 EduPrep x TinyFish AI Agent Automation CLI`);
  console.log(`   Chương trình GDPT 2018 (Toán, Lý, Hóa Lớp 10 -> 12)`);
  console.log(`======================================================\n`);

  if (command === 'help') {
    console.log(`Available commands:`);
    console.log(`  node server/tinyfish_agent/cli.js test`);
    console.log(`      Chạy kiểm tra kết nối với TinyFish Agent và duyệt thử 1 trang.\n`);
    console.log(`  node server/tinyfish_agent/cli.js list [--subject=math|physics|chemistry] [--grade=10|11|12]`);
    console.log(`      Xem toàn bộ hoặc lọc danh mục ${CURRICULUM_CATALOG.length} chuyên đề chuẩn GDPT 2018.\n`);
    console.log(`  node server/tinyfish_agent/cli.js run --index=<0..${CURRICULUM_CATALOG.length - 1}>`);
    console.log(`      Dùng TinyFish Browser Agent duyệt web và sinh bài học theo số thứ tự index.\n`);
    console.log(`  node server/tinyfish_agent/cli.js batch [--subject=math|physics|chemistry] [--count=<number>]`);
    console.log(`      Chạy tự động liên tiếp nhiều bài học để làm giàu kho dữ liệu.\n`);
    process.exit(0);
  }

  if (command === 'list') {
    const subjectArg = args.find(a => a.startsWith('--subject='));
    const gradeArg = args.find(a => a.startsWith('--grade='));
    
    let filtered = CURRICULUM_CATALOG.map((item, idx) => ({ ...item, globalIndex: idx }));

    if (subjectArg) {
      const subj = subjectArg.split('=')[1].toLowerCase();
      filtered = filtered.filter(item => item.subject_id === subj);
    }

    if (gradeArg) {
      const gr = gradeArg.split('=')[1];
      filtered = filtered.filter(item => String(item.grade) === gr);
    }

    console.log(`📋 Danh mục chuyên đề (${filtered.length}/${CURRICULUM_CATALOG.length} bài):`);
    filtered.forEach(item => {
      console.log(`[Index: ${item.globalIndex.toString().padStart(2, '0')}] [${item.subject_id.toUpperCase()} - Lớp ${item.grade}] ${item.topic_title}`);
      console.log(`          URL: ${item.target_url}`);
    });
    console.log(`\nChạy tạo bài học bất kỳ với: node server/tinyfish_agent/cli.js run --index=<Index>`);
    process.exit(0);
  }

  if (command === 'test') {
    console.log(`[CLI] Đang chạy kiểm tra kết nối với TinyFish Web Agent...`);
    try {
      const result = await runAutomation({
        url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BB%8Bnh_l%C3%BD_h%C3%A0m_s%E1%BB%91_cosin',
        goal: 'Trích xuất công thức định lý côsin c^2 = a^2 + b^2 - 2ab cos C dạng KaTeX.'
      });
      console.log(`\n✅ TEST SUCCESS!`);
      console.log(`Agent Run ID: ${result.run_id}`);
      console.log(`Agent Steps:  ${result.steps}`);
      console.log(`Chi phí ví:   ${result.estimatedCost}`);
      console.log(`Trích xuất:   ${String(result.result).slice(0, 200)}...`);
    } catch (err) {
      console.error(`❌ Test failed:`, err.message);
    }
    process.exit(0);
  }

  if (command === 'run') {
    const indexArg = args.find(a => a.startsWith('--index='));
    const index = indexArg ? parseInt(indexArg.split('=')[1], 10) : 0;
    const topic = CURRICULUM_CATALOG[index];
    if (!topic) {
      console.error(`Index ${index} không hợp lệ! Chạy 'node server/tinyfish_agent/cli.js list' để xem danh sách.`);
      process.exit(1);
    }
    try {
      const res = await generateLesson(topic);
      console.log(`\n🎉 Sinh thành công bài học! Theory ID: ${res.theoryId} | Steps: ${res.steps} | Chi phí ước tính: ${res.cost}`);
    } catch (err) {
      console.error(`❌ Lỗi khi sinh bài học:`, err.message);
    }
    process.exit(0);
  }

  if (command === 'batch') {
    const countArg = args.find(a => a.startsWith('--count='));
    const subjectArg = args.find(a => a.startsWith('--subject='));
    const count = countArg ? parseInt(countArg.split('=')[1], 10) : 2;

    let targetList = CURRICULUM_CATALOG;
    if (subjectArg) {
      const subj = subjectArg.split('=')[1].toLowerCase();
      targetList = targetList.filter(t => t.subject_id === subj);
    }

    const runCount = Math.min(count, targetList.length);
    console.log(`[CLI] Đang chạy sinh tự động ${runCount} bài học...`);
    
    for (let i = 0; i < runCount; i++) {
      const topic = targetList[i];
      try {
        await generateLesson(topic);
      } catch (err) {
        console.error(`Lỗi trên chuyên đề ${topic.topic_title}:`, err.message);
      }
    }
    console.log(`\n🎉 Hoàn thành lô ${runCount} bài học! Kiểm tra giao diện web tại: http://localhost:5173/ly-thuyet`);
    process.exit(0);
  }

  console.log(`Lệnh không hợp lệ: ${command}. Chạy 'node server/tinyfish_agent/cli.js help' để xem hướng dẫn.`);
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
