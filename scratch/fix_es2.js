import fs from 'fs';
import { quizItems } from '../data/posn_earth/ES2-data.js';

// We will construct the updated quizItems
const updatedQuizItems = [...quizItems];

// Helper to set question options and answer
function updateQ(number, options, answerStr) {
  const item = updatedQuizItems.find(q => q.number === number);
  if (!item) {
    console.error(`Item ${number} not found!`);
    return;
  }
  item.options = options;
  if (answerStr !== undefined) {
    item.answer = answerStr;
  }
}

// 1. Q13
updateQ(13, [
  "พนังหิน F เกิดขึ้นในมหายุคพาลีโอโซอิก (Paleozoic Era)",
  "ชั้นหิน B อาจเกิดในช่วงสิ้นสุดมหายุคพาลีโอโซอิก (Late Paleozoic Era)",
  "ชั้นหิน E มีอายุแก่กว่ามหายุคพาลีโอโซอิก (Pre-Paleozoic Era)",
  "รอยชั้นไม่ต่อเนื่องเหนือ A เกิดในมหายุคซีโนโซอิก (Cenozoic Era)"
], "ชั้นหิน B อาจเกิดในช่วงสิ้นสุดมหายุคพาลีโอโซอิก (Late Paleozoic Era)");

// 2. Q14
updateQ(14, [
  "ทวีปอเมริกาใต้และแอฟริกาเคยอยู่ติดกัน (Continental Fit)",
  "มหาสมุทรแอตแลนติกกำลังขยายตัวกว้างขึ้น (Seafloor Spreading)",
  "สนามแม่เหล็กโลกเมื่อ 150 ล้านปีก่อนมีขั้วเหมือนปัจจุบัน (Normal Polarity)",
  "หินที่ชายฝั่งอเมริกาใต้จะมีอายุน้อยกว่า 150 ล้านปี (Younger Seafloor Age)"
], "หินที่ชายฝั่งอเมริกาใต้จะมีอายุน้อยกว่า 150 ล้านปี (Younger Seafloor Age)");

// 3. Q16
updateQ(16, [
  "เนื้อโลกมีสถานะเป็นของแข็งแต่ยืดหยุ่น (Solid Plastic Mantle)",
  "แก่นโลกชั้นในมีสถานะเป็นของแข็งและหนาแน่น (Solid Inner Core)",
  "แก่นโลกชั้นนอกมีสถานะเป็นของเหลว (Liquid Outer Core)",
  "เปลือกโลกมีความหนาที่ไม่สม่ำเสมอและเปราะ (Thin Brittle Crust)"
], "แก่นโลกชั้นนอกมีสถานะเป็นของเหลว (Liquid Outer Core)");

// 4. Q20
updateQ(20, [
  "บริเวณ ก เกิดแผ่นดินไหวระดับตื้น (Shallow Focus), ส่วน ข เกิดแผ่นดินไหวระดับลึก (Deep Focus)",
  "บริเวณ ก เป็นแนวแยกตัว (Divergent Boundary), ส่วน ข เป็นแนวเข้าหากัน (Convergent Boundary)",
  "บริเวณ ก หินมีอายุแก่กว่าหินบริเวณ ข (Older Crust), ส่วน ข หินมีอายุน้อยกว่า (Younger Crust)",
  "บริเวณ ก เกิดจากแรงดึงกระทำต่อแผ่นธรณี (Tensional Stress), ส่วน ข เกิดจากแรงบีบอัด (Compressional Stress)"
], "บริเวณ ก เป็นแนวแยกตัว (Divergent Boundary), ส่วน ข เป็นแนวเข้าหากัน (Convergent Boundary)");

// 5. Q21
updateQ(21, [
  "ฟูจิเกิดจากลาวาที่มีความหนืดสูง (High Viscosity), ส่วนเมานาโลอาเกิดจากลาวาที่มีความหนืดต่ำ (Low Viscosity)",
  "ฟูจิเกิดบนแผ่นธรณีทวีป (Continental Plate), ส่วนเมานาโลอาเกิดบนแผ่นธรณีมหาสมุทร (Oceanic Plate)",
  "ฟูจิมีอายุการเกิดน้อยกว่า (Younger Volcano), ส่วนเมานาโลอาเป็นภูเขาไฟที่มีอายุแก่กว่า (Older Volcano)",
  "ฟูจิเกิดจากเขตมุดตัว (Subduction Zone), ส่วนเมานาโลอาเกิดจากตำแหน่งจุดร้อน (Hotspot)"
], "ฟูจิเกิดจากลาวาที่มีความหนืดสูง (High Viscosity), ส่วนเมานาโลอาเกิดจากลาวาที่มีความหนืดต่ำ (Low Viscosity)");

// 6. Q22
updateQ(22, [
  "รอยเลื่อนย้อนมุมต่ำระนาบเฉียง (Thrust Fault)",
  "รอยชั้นไม่ต่อเนื่องแบบคงระดับ (Disconformity)",
  "รอยชั้นไม่ต่อเนื่องแบบเชิงมุม (Angular Unconformity)",
  "รอยชั้นไม่ต่อเนื่องบนหินอัคนีหรือหินแปร (Nonconformity)"
], "รอยชั้นไม่ต่อเนื่องบนหินอัคนีหรือหินแปร (Nonconformity)");

// 7. Q23
updateQ(23, [
  "ปลายแหลมของตัว V จะชี้ไปทางปลายน้ำเสมอ (Downstream direction)",
  "ปลายแหลมของตัว V จะชี้ไปทางต้นน้ำเสมอ (Upstream direction)",
  "รูปตัว V ที่แหลมมากแสดงถึงหุบเขาที่ชันมาก (Steep valley)",
  "รูปตัว V ที่กว้างมากแสดงว่าแม่น้ำไหลในที่ราบ (Wide valley)"
], "ปลายแหลมของตัว V จะชี้ไปทางต้นน้ำเสมอ (Upstream direction)");

// 8. Q24
updateQ(24, [
  "เคยเกิดการระเบิดของภูเขาไฟอย่างรุนแรงในอดีต (Volcanic Eruption)",
  "เคยถูกปกคลุมด้วยธารน้ำแข็งขนาดใหญ่ (Glacial Coverage)",
  "เคยอยู่ลึกใต้ผิวโลกแล้วถูกยกตัวและกัดกร่อนจนโผล่ขึ้นมา (Crustal Uplift & Erosion)",
  "เคยเป็นพื้นที่สะสมตะกอนอย่างรวดเร็วในทะเลลึก (Deep-sea Sedimentation)"
], "เคยอยู่ลึกใต้ผิวโลกแล้วถูกยกตัวและกัดกร่อนจนโผล่ขึ้นมา (Crustal Uplift & Erosion)");

// 9. Q25
updateQ(25, [
  "เป็นโครงสร้างที่เกิดจากการแทรกดันของหินหนืดร้อน (Magma Intrusion)",
  "เป็นโครงสร้างที่ทำหน้าที่เป็นกับดัก (Structural Trap) ให้ปิโตรเลียมสะสมตัวได้",
  "เป็นโครงสร้างที่เหมาะสมต่อการสะสมซากดึกดำบรรพ์ (Fossil Preservation)",
  "เป็นโครงสร้างที่สัมพันธ์โดยตรงกับการเกิดแหล่งถ่านหิน (Coal Bed Formation)"
], "เป็นโครงสร้างที่ทำหน้าที่เป็นกับดัก (Structural Trap) ให้ปิโตรเลียมสะสมตัวได้");

// 10. Q26
updateQ(26, [
  "ระดับน้ำทะเลในอดีตเคยสูงท่วมยอดเขาแอลป์ในปัจจุบัน (Sea Level Rise)",
  "บริเวณนั้นเคยเป็นทะเลตื้นมาก่อนแล้วถูกยกตัวขึ้นมาเป็นภูเขา (Shallow Sea Uplift)",
  "นกโบราณขนาดใหญ่เคยคาบปะการังขึ้นไปทำรังบนยอดเขา (Animal Transport)",
  "ปะการังในอดีตเคยเป็นสิ่งมีชีวิตที่สามารถอาศัยอยู่บนบกได้ (Terrestrial Species)"
], "บริเวณนั้นเคยเป็นทะเลตื้นมาก่อนแล้วถูกยกตัวขึ้นมาเป็นภูเขา (Shallow Sea Uplift)");

// 11. Q27
updateQ(27, [
  "รูปร่างของทวีปต่างๆ ที่ดูเหมือนจะต่อกันได้เหมือนจิ๊กซอว์ (Continental Fit)",
  "การพบซากดึกดำบรรพ์ของพืชและสัตว์ชนิดเดียวกันในหลายทวีป (Fossil Evidence)",
  "รูปแบบภาวะแม่เหล็กบรรพกาลที่สมมาตรกันบริเวณสันเขากลางมหาสมุทร (Paleomagnetism)",
  "การพบร่องรอยของธารน้ำแข็งโบราณในบริเวณที่ปัจจุบันเป็นเขตร้อน (Glacial Evidence)"
], "รูปแบบภาวะแม่เหล็กบรรพกาลที่สมมาตรกันบริเวณสันเขากลางมหาสมุทร (Paleomagnetism)");

// 12. Q28
updateQ(28, [
  "เกาะทางทิศตะวันตกเฉียงเหนือสุดจะมีอายุน้อยที่สุด (Northwest Youngest Island)",
  "เกาะทางทิศตะวันออกเฉียงใต้สุดจะมีอายุน้อยที่สุดและยังคุกรุ่นอยู่ (Southeast Youngest Active Island)",
  "เกาะทุกเกาะที่เกิดขึ้นในแนวเทือกเขาจะมีอายุใกล้เคียงกันทั้งหมด (Same Age Island Chain)",
  "จะไม่เกิดเป็นแนวเกาะแต่จะเกิดเป็นภูเขาไฟขนาดใหญ่เพียงลูกเดียว (Single Giant Volcano)"
], "เกาะทางทิศตะวันออกเฉียงใต้สุดจะมีอายุน้อยที่สุดและยังคุกรุ่นอยู่ (Southeast Youngest Active Island)");

// 13. Q29
updateQ(29, [
  "การเย็นตัวอย่างรวดเร็วของลาวาบนพื้นผิวโลก (Extrusive Igneous Cooling)",
  "การผุพังและการกัดกร่อนบนพื้นผิวโลกเป็นเวลานาน (Weathering and Erosion)",
  "การได้รับความร้อนและความดันสูงจนเกิดการตกผลึกใหม่ (Heat & Pressure Recrystallization)",
  "การตกตะกอนทางเคมีจากสารละลายในทะเลสาบ (Chemical Precipitation)"
], "การได้รับความร้อนและความดันสูงจนเกิดการตกผลึกใหม่ (Heat & Pressure Recrystallization)");

// 14. Q30
updateQ(30, [
  "ขอบแผ่นธรณีเคลื่อนที่แยกตัวออกจากกัน (Divergent Boundary)",
  "ขอบแผ่นธรณีเคลื่อนที่เข้าหากัน (Convergent Boundary)",
  "ขอบแผ่นธรณีแบบมุดตัวใต้ทวีป (Subduction Boundary)",
  "ขอบแผ่นธรณีเคลื่อนที่ผ่านกันในแนวระดับ (Transform Boundary)"
], "ขอบแผ่นธรณีเคลื่อนที่ผ่านกันในแนวระดับ (Transform Boundary)");

// 15. Q31
updateQ(31, [
  "การหาอายุจากคาร์บอน-14 ในซากพืชที่พบในชั้นหินตะกอนที่อยู่ด้านบน (Carbon-14 Dating)",
  "การหาอายุจากโพแทสเซียม-อาร์กอนของผลึกแร่ในชั้นเถ้าภูเขาไฟ (Potassium-Argon Dating)",
  "การหาอายุโดยเปรียบเทียบกับซากดึกดำบรรพ์ที่พบในชั้นหินตะกอนด้านล่าง (Relative Fossil Dating)",
  "การหาอายุโดยการวัดความหนาของชั้นเถ้าและคำนวณอัตราการสะสมตัว (Sedimentation Rate Calculation)"
], "การหาอายุจากโพแทสเซียม-อาร์กอนของผลึกแร่ในชั้นเถ้าภูเขาไฟ (Potassium-Argon Dating)");

// 16. Q33
updateQ(33, [
  "หินทรายเกิดการตกผลึกขึ้นมาหลังจากที่หินแกรนิตแข็งตัวแล้ว (Post-crystallization)",
  "หินหนืดแกรนิตได้ห่อหุ้มเศษหินทรายเดิมไว้ขณะที่แทรกดันขึ้นมา (Country Rock Inclusion)",
  "หินทรายและหินแกรนิตเกิดการแปรสภาพไปพร้อมๆ กันภายใต้ความร้อน (Simultaneous Metamorphism)",
  "เป็นตะกอนที่ถูกพัดพามาปะปนกับหินหนืดที่ยังไม่แข็งตัวบนพื้นผิว (Surface Contamination)"
], "หินหนืดแกรนิตได้ห่อหุ้มเศษหินทรายเดิมไว้ขณะที่แทรกดันขึ้นมา (Country Rock Inclusion)");

// 17. Q34
updateQ(34, [
  "จะไม่มีการเปลี่ยนแปลงของฤดูกาลบนพื้นผิวโลก (Seasonal Variation)",
  "จะไม่มีการแปรสัณฐานของแผ่นธรณี (Plate Tectonics)",
  "จะไม่มีการเกิดวัฏจักรของหินบนพื้นผิวโลก (Rock Cycle)",
  "จะไม่มีการเกิดสนามแม่เหล็กโลกจากแก่นโลก (Geomagnetic Field)"
], "จะไม่มีการแปรสัณฐานของแผ่นธรณี (Plate Tectonics)");

// 18. Q35
updateQ(35, [
  "หินชนวนมีขนาดเม็ดตะกอนใหญ่กว่าหินดินดานอย่างเห็นได้ชัด (Coarse Grain Size)",
  "หินชนวนมีริ้วขนาน (Foliation) ส่วนหินดินดานมีชั้นบาง (Lamination)",
  "หินชนวนเกิดในสภาพแวดล้อมทะเลลึก ส่วนหินดินดานเกิดบนบก (Deposition Environment)",
  "หินชนวนทำปฏิกิริยากับกรดได้ดี ส่วนหินดินดานไม่ทำปฏิกิริยา (Acid Reaction)"
], "หินชนวนมีริ้วขนาน (Foliation) ส่วนหินดินดานมีชั้นบาง (Lamination)");

// 19. Q36
updateQ(36, [
  "มีสีเข้ม ประกอบด้วยแร่โอลิวีนและไพรอกซีนเป็นหลัก (Mafic/Ultramafic)",
  "มีสีอ่อน ประกอบด้วยแร่ควอตซ์และเฟลด์สปาร์เป็นหลัก (Felsic)",
  "มีความหนาแน่นสูง และมักพบเป็นเปลือกโลกมหาสมุทร (Oceanic Crust)",
  "มีจุดหลอมเหลวต่ำ และมักเกิดเป็นภูเขาไฟรูปโล่ (Shield Volcano)"
], "มีสีอ่อน ประกอบด้วยแร่ควอตซ์และเฟลด์สปาร์เป็นหลัก (Felsic)");

// 20. Q38
updateQ(38, [
  "การตกผลึกของแร่ภายใต้ความดันสูงขณะที่แมกมาแข็งตัว (High Pressure Crystallization)",
  "การหดตัวของลาวาหรือหินอัคนีแทรกซอนตื้นๆ ขณะที่เย็นตัวลง (Cooling Contraction Joints)",
  "การกัดเซาะของกระแสลมและกระแสน้ำตามแนวรอยแตกเดิม (Wind & Water Erosion)",
  "การเกิดรอยแตกจากการเคลื่อนที่ของรอยเลื่อนในบริเวณนั้น (Tectonic Faulting)"
], "การหดตัวของลาวาหรือหินอัคนีแทรกซอนตื้นๆ ขณะที่เย็นตัวลง (Cooling Contraction Joints)");

// 21. Q39
updateQ(39, [
  "สภาพแวดล้อมแบบทะเลลึกและหนาวเย็น (Deep cold sea)",
  "สภาพแวดล้อมแบบปากแม่น้ำที่มีตะกอนมาก (Deltaic environment)",
  "สภาพแวดล้อมแบบทะเลตื้นในเขตแห้งแล้ง (Arid shallow sea)",
  "สภาพแวดล้อมแบบที่ราบน้ำท่วมถึง (Fluvial floodplain)"
], "สภาพแวดล้อมแบบทะเลตื้นในเขตแห้งแล้ง (Arid shallow sea)");

// 22. Q40
updateQ(40, [
  "หินดินดาน -> หินชีสต์ -> หินชนวน -> หินไนส์ (Shale -> Schist -> Slate -> Gneiss)",
  "หินดินดาน -> หินไนส์ -> หินชีสต์ -> หินชนวน (Shale -> Gneiss -> Schist -> Slate)",
  "หินดินดาน -> หินชนวน -> หินชีสต์ -> หินไนส์ (Shale -> Slate -> Schist -> Gneiss)",
  "หินดินดาน -> หินชนวน -> หินไนส์ -> หินชีสต์ (Shale -> Slate -> Gneiss -> Schist)"
], "หินดินดาน -> หินชนวน -> หินชีสต์ -> หินไนส์ (Shale -> Slate -> Schist -> Gneiss)");

// 23. Q41
updateQ(41, [
  "หินทรายที่มีสารเชื่อมเป็นแคลไซต์ (Calcareous Sandstone)",
  "หินปูนเนื้อทราย (Sandy Limestone)",
  "หินควอร์ตไซต์ที่ไม่บริสุทธิ์และมีแคลไซต์ปน (Impure Quartzite)",
  "หินอ่อนที่มีเม็ดทรายแทรกอยู่ภายใน (Sandy Marble)"
], "หินปูนเนื้อทราย (Sandy Limestone)");

// 24. Q42
updateQ(42, [
  "สิ่งมีชีวิตชนิดนี้สามารถว่ายน้ำข้ามมหาสมุทรแอตแลนติกได้ (Oceanic Swimming)",
  "ในอดีตทวีปอเมริกาใต้และแอฟริกาเคยเป็นแผ่นดินเดียวกัน (Continental Drift)",
  "เกิดวิวัฒนาการเบนเข้าหากัน (Convergent Evolution) ทำให้มีลักษณะคล้ายกัน",
  "เคยมีสะพานแผ่นดิน (Land Bridge) เชื่อมระหว่างสองทวีปในอดีต"
], "ในอดีตทวีปอเมริกาใต้และแอฟริกาเคยเป็นแผ่นดินเดียวกัน (Continental Drift)");

// 25. Q43
updateQ(43, [
  "เป็นช่วงเวลาที่เกิดการสะสมตะกอนอย่างต่อเนื่องและสม่ำเสมอ (Continuous Deposition)",
  "เป็นช่วงเวลาที่บันทึกทางธรณีวิทยาขาดหายไปจากการไม่สะสมตัวหรือการกัดกร่อน (Erosion or Non-deposition)",
  "เป็นแนวรอยต่อที่หินหนืดร้อนแทรกดันขึ้นมาสัมผัสกับหินเดิม (Igneous Intrusion Contact)",
  "เป็นแนวรอยต่อที่เกิดการเลื่อนตัวของหินจากเหตุการณ์แผ่นดินไหว (Fault Displacement)"
], "เป็นช่วงเวลาที่บันทึกทางธรณีวิทยาขาดหายไปจากการไม่สะสมตัวหรือการกัดกร่อน (Erosion or Non-deposition)");

// 26. Q44
updateQ(44, [
  "ทำให้แผ่นเปลือกโลกมหาสมุทรเกิดการมุดตัว (Subduction) ลงใต้แผ่นเปลือกโลกทวีปได้",
  "ทำให้แผ่นเปลือกโลกมหาสมุทรลอยตัวสูงกว่าแผ่นเปลือกโลกทวีปตามหลักการลอยตัว (Isostasy)",
  "ทำให้เกิดภูเขาไฟรูปโล่ (Shield Volcano) บนแผ่นเปลือกโลกมหาสมุทรได้ง่ายกว่า",
  "ทำให้แผ่นเปลือกโลกมหาสมุทรเคลื่อนที่ด้วยอัตราเร็วสูงกว่าแผ่นเปลือกโลกทวีป (Plate Velocity)"
], "ทำให้แผ่นเปลือกโลกมหาสมุทรเกิดการมุดตัว (Subduction) ลงใต้แผ่นเปลือกโลกทวีปได้");

// 27. Q45
updateQ(45, [
  "สันเขากลางมหาสมุทรแอตแลนติก (Mid-Atlantic Ridge)",
  "รอยเลื่อนซานแอนเดรียส (San Andreas Fault)",
  "ร่องลึกก้นสมุทรมาเรียนา (Mariana Trench)",
  "บริเวณจุดร้อนฮาวาย (Hawaiian Hotspot)"
], "ร่องลึกก้นสมุทรมาเรียนา (Mariana Trench)");

// 28. Q46
updateQ(46, [
  "ธรณีภาคแบ่งตามคุณสมบัติเชิงกล (Mechanical Properties), เปลือกโลกแบ่งตามองค์ประกอบทางเคมี (Chemical Composition)",
  "ธรณีภาคมีความหนาเท่ากับเปลือกโลกเสมอในทุกบริเวณ (Equal Thickness)",
  "ธรณีภาคประกอบด้วยเปลือกโลกมหาสมุทรเท่านั้น ไม่รวมเปลือกโลกทวีป (Oceanic Only)",
  "ธรณีภาคเป็นชั้นของเหลวที่อยู่ใต้ชั้นเนื้อโลกทั้งหมด (Liquid Layer)"
], "ธรณีภาคแบ่งตามคุณสมบัติเชิงกล (Mechanical Properties), เปลือกโลกแบ่งตามองค์ประกอบทางเคมี (Chemical Composition)");

// 29. Q47
updateQ(47, [
  "การสะสมตัวของชั้นหินในแนวราบ (Horizontal Deposition)",
  "การเอียงเทของชั้นหินที่สะสมตัวแล้ว (Tilting of Strata)",
  "การเกิดของรอยเลื่อนย้อนมุมต่ำ (Thrust Faulting)",
  "การแทรกดันของหินอัคนีผ่านชั้นหิน (Igneous Intrusion)"
], "การเอียงเทของชั้นหินที่สะสมตัวแล้ว (Tilting of Strata)");

// 30. Q48
updateQ(48, [
  "ทดสอบสีผงของแร่ (Streak Test)",
  "ทดสอบความวาวของแร่ (Luster Test)",
  "วัดความถ่วงจำเพาะของแร่ (Specific Gravity Test)",
  "ทดสอบปฏิกิริยากับกรด (Acid Reaction Test)"
], "ทดสอบปฏิกิริยากับกรด (Acid Reaction Test)");

// 31. Q49
updateQ(49, [
  "โครงสร้างประทุนคว่ำ (Anticline)",
  "โครงสร้างประทุนหงาย (Syncline)",
  "โครงสร้างรอยเลื่อนปกติ (Normal Fault)",
  "โครงสร้างแบบโดม (Dome Structure)"
], "โครงสร้างประทุนหงาย (Syncline)");

// 32. Q50
updateQ(50, [
  "มีความหนาแน่นน้อยกว่าหินข้างบนและมีสภาพพลาสติก (Low Density & Plasticity)",
  "มีความแข็งแกร่งมากกว่าหินที่อยู่โดยรอบอย่างมาก (High Mechanical Strength)",
  "มีคุณสมบัติในการละลายน้ำได้ดีเมื่อเทียบกับหินอื่น (High Water Solubility)",
  "มีจุดหลอมเหลวที่สูงกว่าหินทั่วไปในระดับความลึกเดียวกัน (High Melting Point)"
], "มีความหนาแน่นน้อยกว่าหินข้างบนและมีสภาพพลาสติก (Low Density & Plasticity)");

// 33. Q53
updateQ(53, [
  "เกิดจากความแตกต่างของอุณหภูมิ (Temperature Difference)",
  "เกิดจากความแตกต่างของความกดอากาศ (Pressure Gradient)",
  "เกิดจากแรงเสียดทานของพื้นผิวโลก (Friction Force)",
  "เกิดจากการหมุนรอบตัวเองของโลก (Earth's Rotation)"
], "เกิดจากการหมุนรอบตัวเองของโลก (Earth's Rotation)");

// 34. Q56
updateQ(56, [
  "เกิดจากอิทธิพลของลมมรสุมประจำฤดู (Seasonal Monsoon)",
  "เกิดจากการหมุนเวียนของกระแสน้ำในมหาสมุทร (Ocean Current)",
  "เกิดจากความแตกต่างในการรับและคายความร้อนของดินและน้ำ (Differential Heating)",
  "เกิดจากอิทธิพลของแรงคอริออลิสโดยตรง (Coriolis Effect)"
], "เกิดจากความแตกต่างในการรับและคายความร้อนของดินและน้ำ (Differential Heating)");

// 35. Q57
updateQ(57, [
  "อากาศจมตัว ลมหมุนตามเข็มนาฬิกา (Sinking Air, Clockwise Wind)",
  "อากาศยกตัว ลมหมุนตามเข็มนาฬิกา (Rising Air, Clockwise Wind)",
  "อากาศจมตัว ลมหมุนทวนเข็มนาฬิกา (Sinking Air, Counterclockwise Wind)",
  "อากาศยกตัว ลมหมุนทวนเข็มนาฬิกา (Rising Air, Counterclockwise Wind)"
], "อากาศจมตัว ลมหมุนตามเข็มนาฬิกา (Sinking Air, Clockwise Wind)");

// 36. Q61
updateQ(61, [
  "การที่ลมค้าในมหาสมุทรมีกำลังแรงขึ้น (Stronger Trade Winds)",
  "การที่ลมค้าในมหาสมุทรมีกำลังอ่อนลง (Weaker Trade Winds)",
  "การที่กระแสน้ำอุ่นไหลไปทางตะวันตกมากขึ้น (Westward Warm Current)",
  "การเกิดปรากฏการณ์น้ำผุดที่รุนแรงขึ้น (Stronger Upwelling)"
], "การที่ลมค้าในมหาสมุทรมีกำลังอ่อนลง (Weaker Trade Winds)");

// 37. Q62
updateQ(62, [
  "ท้องฟ้าโปร่ง, ลมสงบ, ความเร็ว 0 นอต, อากาศแห้ง (Clear, Calm, 0 kt, Dry)",
  "มีเมฆเต็มท้องฟ้า, ลมตะวันตกเฉียงใต้, ความเร็ว 25 นอต, อากาศชื้น (Overcast, SW Wind, 25 kt, Moist)",
  "มีเมฆเต็มท้องฟ้า, ลมตะวันตกเฉียงใต้, ความเร็ว 25 นอต, อากาศชื้นมาก (Overcast, SW Wind, 25 kt, Very Humid)",
  "มีเมฆบางส่วน, ลมตะวันตกเฉียงใต้, ความเร็ว 20 นอต, อากาศแห้ง (Partly Cloudy, SW Wind, 20 kt, Dry)"
], "มีเมฆเต็มท้องฟ้า, ลมตะวันตกเฉียงใต้, ความเร็ว 25 นอต, อากาศชื้นมาก (Overcast, SW Wind, 25 kt, Very Humid)");

// 38. Q64
updateQ(64, [
  "ความชื้นสัมพัทธ์ ณ เวลา 18:00 น. จะสูงขึ้น (Relative Humidity Increases)",
  "ความชื้นสัมพัทธ์ ณ เวลา 18:00 น. จะลดลง (Relative Humidity Decreases)",
  "ความชื้นสัมบูรณ์ในอากาศจะเปลี่ยนแปลงไป (Absolute Humidity Changes)",
  "อากาศจะเกิดการอิ่มตัวที่อุณหภูมิ 35°C (Saturation at 35°C)"
], "ความชื้นสัมพัทธ์ ณ เวลา 18:00 น. จะสูงขึ้น (Relative Humidity Increases)");

// 39. Q67
updateQ(67, [
  "เขตเงาฝน (Rain Shadow), ซึ่งเกิดจากอากาศจมตัวและอุ่นขึ้น",
  "ลมภูเขา (Mountain Breeze), ซึ่งเกิดจากความแตกต่างของความกดอากาศ",
  "การผกผันของอุณหภูมิ (Temperature Inversion), ซึ่งเกิดจากอากาศเย็นอยู่ใต้อากาศอุ่น",
  "แนวปะทะอากาศ (Weather Front), ซึ่งเกิดจากมวลอากาศต่างชนิดกัน"
], "เขตเงาฝน (Rain Shadow), ซึ่งเกิดจากอากาศจมตัวและอุ่นขึ้น");

// 40. Q68
updateQ(68, [
  "เพราะมีเมฆมากในตอนกลางวันและมีเมฆน้อยในตอนกลางคืน (Cloud Cover Effect)",
  "เพราะทรายมีการสะท้อนแสงหรือค่าอัลบีโด (Albedo) ที่สูงมาก",
  "เพราะในบรรยากาศมีปริมาณไอน้ำซึ่งเป็นแก๊สเรือนกระจกน้อย (Low Water Vapor Content)",
  "เพราะได้รับอิทธิพลจากลมค้าที่พัดพาความแห้งแล้งมา (Trade Winds Effect)"
], "เพราะในบรรยากาศมีปริมาณไอน้ำซึ่งเป็นแก๊สเรือนกระจกน้อย (Low Water Vapor Content)");

// 41. Q69
updateQ(69, [
  "เกิดเซลล์การหมุนเวียนเพียงเซลล์เดียวในแต่ละซีกโลก (Single-cell Convection)",
  "เกิดเซลล์การหมุนเวียน 3 เซลล์เหมือนเดิมแต่ทิศทางลมเปลี่ยน (Three-cell Convection)",
  "จะไม่มีการเกิดกระแสลมพัดบนพื้นผิวโลกเลย (No Surface Wind)",
  "ลมจะพัดจากขั้วโลกไปยังเส้นศูนย์สูตรเป็นเส้นตรง (Direct Meridional Flow)"
], "เกิดเซลล์การหมุนเวียนเพียงเซลล์เดียวในแต่ละซีกโลก (Single-cell Convection)");

// 42. Q70
updateQ(70, [
  "มวลอากาศร้อนชื้นจากมหาสมุทรอินเดีย และหย่อมความกดอากาศต่ำ (Maritime Tropical Air Mass, L)",
  "มวลอากาศเย็นและแห้งจากประเทศจีน และหย่อมความกดอากาศสูง (Continental Polar Air Mass, H)",
  "มวลอากาศร้อนและแห้งจากทะเลทราย และหย่อมความกดอากาศสูง (Continental Tropical Air Mass, H)",
  "มวลอากาศเย็นและชื้นจากทะเลจีนใต้ และหย่อมความกดอากาศต่ำ (Maritime Polar Air Mass, L)"
], "มวลอากาศเย็นและแห้งจากประเทศจีน และหย่อมความกดอากาศสูง (Continental Polar Air Mass, H)");

// 43. Q71
updateQ(71, [
  "กำลังลดระดับเพดานบินลง (Descending Altitude)",
  "กำลังเพิ่มระดับเพดานบินขึ้น (Ascending Altitude)",
  "กำลังบินในระดับความสูงคงที่ (Cruising Altitude)",
  "กำลังเตรียมตัวเพื่อลงจอด (Landing Approach)"
], "กำลังเพิ่มระดับเพดานบินขึ้น (Ascending Altitude)");

// 44. Q72
updateQ(72, [
  "เพราะเป็นบริเวณที่มีความเร็วลมเฉลี่ยต่ำที่สุด (Low Wind Speed)",
  "เพราะระนาบการหมุนของโลกขนานไปกับพื้นผิว (Horizontal Rotation Axis)",
  "เพราะเป็นบริเวณที่ได้รับพลังงานจากดวงอาทิตย์มากที่สุด (Maximum Solar Radiation)",
  "เพราะเป็นบริเวณที่ไม่มีแรงเสียดทานจากพื้นผิว (Zero Friction)"
], "เพราะระนาบการหมุนของโลกขนานไปกับพื้นผิว (Horizontal Rotation Axis)");

// 45. Q73
updateQ(73, [
  "แสดงว่าอุณหภูมิในบริเวณนั้นเปลี่ยนแปลงรวดเร็ว (Rapid Temperature Change)",
  "แสดงว่าลมในบริเวณนั้นมีความเร็วสูงหรือพัดแรง (High Wind Speed)",
  "แสดงว่าบริเวณนั้นมีโอกาสที่จะเกิดฝนตกหนัก (Heavy Rainfall Probability)",
  "แสดงว่าบริเวณนั้นเป็นศูนย์กลางหย่อมความกดอากาศสูง (High Pressure Center)"
], "แสดงว่าลมในบริเวณนั้นมีความเร็วสูงหรือพัดแรง (High Wind Speed)");

// 46. Q74
updateQ(74, [
  "อุณหภูมิผิวน้ำทะเลสูงกว่า 26.5°C (Sea Surface Temperature > 26.5°C)",
  "แรงคอริออลิสที่มากพอ (Sufficient Coriolis Force)",
  "ลมเฉือนในแนวดิ่งที่มีค่าน้อย (Low Vertical Wind Shear)",
  "หย่อมความกดอากาศสูงที่พื้นผิว (Surface High Pressure System)"
], "หย่อมความกดอากาศสูงที่พื้นผิว (Surface High Pressure System)");

// 47. Q75
updateQ(75, [
  "เกิดจากการพาความร้อนจากพื้นดินขึ้นสู่บรรยากาศ (Thermal Convection)",
  "เกิดจากการแผ่รังสีความร้อนออกจากพื้นดินในเวลากลางคืน (Radiative Cooling)",
  "เกิดจากการที่ลมพัดพาอากาศชื้นมาปะทะกับอากาศเย็น (Advection Fog)",
  "เกิดจากการระเหยของน้ำจากแหล่งน้ำที่อยู่ใกล้เคียง (Evaporation Fog)"
], "เกิดจากการแผ่รังสีความร้อนออกจากพื้นดินในเวลากลางคืน (Radiative Cooling)");

// 48. Q76
updateQ(76, [
  "ความชื้นสัมพัทธ์เพิ่มขึ้น (Increase)",
  "ความชื้นสัมพัทธ์ลดลง (Decrease)",
  "ความชื้นสัมพัทธ์เท่าเดิม (Constant)",
  "ความชื้นสัมพัทธ์อาจเพิ่มขึ้นหรือลดลงก็ได้ (Variable)"
], "ความชื้นสัมพัทธ์เพิ่มขึ้น (Increase)");

// 49. Q77
updateQ(77, [
  "การยกตัวจากการพาความร้อน (Convectional lifting)",
  "การยกตัวตามแนวปะทะอากาศ (Frontal wedging)",
  "การยกตัวตามลักษณะภูมิประเทศ (Orographic lifting)",
  "การยกตัวจากการลู่เข้าของลม (Convergent lifting)"
], "การยกตัวตามลักษณะภูมิประเทศ (Orographic lifting)");

// 50. Q78
updateQ(78, [
  "มีปริมาณฝนตกแห้งแล้งกว่าปกติ (Drier than Normal)",
  "มีปริมาณฝนตกมากกว่าปกติ (Wetter than Normal)",
  "มีอุณหภูมิสูงขึ้นมากกว่าปกติ (Warmer than Normal)",
  "สภาพอากาศไม่มีความเปลี่ยนแปลง (No Significant Effect)"
], "มีปริมาณฝนตกมากกว่าปกติ (Wetter than Normal)");

// 51. Q79
updateQ(79, [
  "ก้อนอากาศที่ถูกยกตัวขึ้นจะเย็นกว่าอากาศโดยรอบและจมตัวกลับลงมา (Sinking Air Parcel)",
  "ก้อนอากาศที่ถูกยกตัวขึ้นจะอุ่นกว่าอากาศโดยรอบและลอยตัวสูงขึ้นไปอีก (Rising Air Parcel)",
  "ก้อนอากาศที่ถูกยกตัวขึ้นจะขยายตัวและก่อตัวเป็นเมฆแนวตั้งขนาดใหญ่ (Vertical Cloud Formation)",
  "ก้อนอากาศที่ถูกยกตัวขึ้นจะได้รับความร้อนสะสมจนเกิดการหมุนเวียนรุนแรง (Thermal Circulation)"
], "ก้อนอากาศที่ถูกยกตัวขึ้นจะเย็นกว่าอากาศโดยรอบและจมตัวกลับลงมา (Sinking Air Parcel)");

// 52. Q80
updateQ(80, [
  "พื้นผิวของป่าไม้ที่เขียวชอุ่ม (Dense Forest)",
  "พื้นผิวของน้ำในมหาสมุทร (Ocean Water)",
  "พื้นผิวของถนนที่ลาดยางมะตอย (Asphalt Road)",
  "พื้นผิวของทุ่งน้ำแข็งที่ปกคลุมด้วยหิมะ (Snow Cover)"
], "พื้นผิวของทุ่งน้ำแข็งที่ปกคลุมด้วยหิมะ (Snow Cover)");

// 53. Q81
updateQ(81, [
  "บรรยากาศในวันนั้นมีเสถียรภาพมาก (Stable Atmosphere)",
  "บรรยากาศในวันนั้นไม่มีเสถียรภาพ (Unstable Atmosphere)",
  "เกิดการผกผันของอุณหภูมิในบรรยากาศ (Temperature Inversion)",
  "มีลมเฉือนในแนวดิ่งที่รุนแรงมาก (Strong Vertical Wind Shear)"
], "บรรยากาศในวันนั้นไม่มีเสถียรภาพ (Unstable Atmosphere)");

// 54. Q82
updateQ(82, [
  "ทำให้อุณหภูมิเฉลี่ยของโลกสูงขึ้น (Global Warming)",
  "ทำให้ปริมาณรังสีอัลตราไวโอเลตเพิ่มขึ้น (Increased UV Radiation)",
  "ทำให้เกิดปรากฏการณ์ฝนกรดมากขึ้น (Acid Rain Formation)",
  "ทำให้สภาพอากาศแปรปรวนรุนแรงขึ้น (Extreme Weather Events)"
], "ทำให้ปริมาณรังสีอัลตราไวโอเลตเพิ่มขึ้น (Increased UV Radiation)");

// 55. Q83
updateQ(83, [
  "อิทธิพลโดยตรงจากลมมรสุมตะวันตกเฉียงใต้ (Southwest Monsoon Effect)",
  "การปะทะกันของมวลอากาศเย็นและมวลอากาศร้อนชื้น (Cold & Warm Air Collision)",
  "การก่อตัวของพายุดีเปรสชันในทะเลจีนใต้ (Depression Formation)",
  "อิทธิพลโดยตรงจากปรากฏการณ์เอลนีโญ (El Niño Effect)"
], "การปะทะกันของมวลอากาศเย็นและมวลอากาศร้อนชื้น (Cold & Warm Air Collision)");

// 56. Q84
updateQ(84, [
  "เพื่อหลีกเลี่ยงสภาพอากาศแปรปรวนในชั้นโทรโพสเฟียร์ (Avoid Tropospheric Weather)",
  "เพราะอากาศมีความหนาแน่นสูงทำให้เกิดแรงยกได้ดี (High Air Density for Lift)",
  "เพื่อใช้ประโยชน์จากกระแสลมกรดในการเดินทาง (Jet Stream Advantage)",
  "เพราะมีชั้นโอโซนช่วยป้องกันรังสีอันตราย (Ozone Protection)"
], "เพื่อหลีกเลี่ยงสภาพอากาศแปรปรวนในชั้นโทรโพสเฟียร์ (Avoid Tropospheric Weather)");

// 57. Q85
updateQ(85, [
  "อาศัยการวัดอุณหภูมิของยอดเมฆ (Cloud Top Temperature)",
  "อาศัยการวัดสัญญาณสะท้อนกลับของคลื่นไมโครเวฟ (Microwave Reflection Signal)",
  "อาศัยการถ่ายภาพเมฆจากดาวเทียมในอวกาศ (Satellite Cloud Imagery)",
  "อาศัยการวัดความชื้นสัมพัทธ์ในบรรยากาศ (Relative Humidity Measurement)"
], "อาศัยการวัดสัญญาณสะท้อนกลับของคลื่นไมโครเวฟ (Microwave Reflection Signal)");

// 58. Q86
updateQ(86, [
  "บริเวณที่ลมค้าจากซีกโลกเหนือและซีกโลกใต้พัดมาบรรจบกัน (Trade Wind Convergence)",
  "บริเวณละติจูด 30 องศา ที่อากาศเกิดการจมตัวลง (Subtropical High Sinking)",
  "บริเวณที่มวลอากาศเย็นจากขั้วโลกปะทะกับมวลอากาศอุ่น (Polar Front Boundary)",
  "บริเวณที่เกิดพายุหมุนเขตร้อนถี่และบ่อยที่สุด (Tropical Cyclone Belt)"
], "บริเวณที่ลมค้าจากซีกโลกเหนือและซีกโลกใต้พัดมาบรรจบกัน (Trade Wind Convergence)");

// 59. Q87
updateQ(87, [
  "การมีพื้นที่สีเขียวและแหล่งน้ำน้อย (Lack of Vegetation & Water)",
  "วัสดุก่อสร้าง เช่น คอนกรีต ดูดกลืนความร้อนได้ดี (High Heat Capacity Materials)",
  "ความร้อนที่ปล่อยจากเครื่องปรับอากาศและการจราจร (Anthropogenic Heat Release)",
  "การมีค่าอัลบีโดโดยรวมสูงกว่าพื้นที่ชนบท (Higher Overall Albedo)"
], "การมีค่าอัลบีโดโดยรวมสูงกว่าพื้นที่ชนบท (Higher Overall Albedo)");

// 60. Q88
updateQ(88, [
  "อากาศจะแห้งและมีความชื้นต่ำมาก (Low Humidity)",
  "ความชื้นสัมพัทธ์เท่ากับ 100% และเกิดการควบแน่น (100% Relative Humidity & Condensation)",
  "จะเกิดลมพัดแรงและมีอากาศแปรปรวน (Strong Wind & Turbulence)",
  "ท้องฟ้าจะโปร่งใสและไม่มีเมฆปกคลุม (Clear Sky)"
], "ความชื้นสัมพัทธ์เท่ากับ 100% และเกิดการควบแน่น (100% Relative Humidity & Condensation)");

// 61. Q89
updateQ(89, [
  "หย่อมความกดอากาศสูงในมหาสมุทรอินเดีย เป็นลมร้อนและชื้น (Indian Ocean High, Warm & Moist)",
  "หย่อมความกดอากาศสูงในประเทศจีน เป็นลมเย็นและแห้ง (China High, Cold & Dry)",
  "หย่อมความกดอากาศต่ำในมหาสมุทรแปซิฟิก เป็นลมร้อนและชื้น (Pacific Low, Warm & Moist)",
  "หย่อมความกดอากาศสูงในไซบีเรีย เป็นลมเย็นและแห้ง (Siberian High, Cold & Dry)"
], "หย่อมความกดอากาศสูงในมหาสมุทรอินเดีย เป็นลมร้อนและชื้น (Indian Ocean High, Warm & Moist)");

// 62. Q90
updateQ(90, [
  "เกิดจากการเสียดสีกันของผลึกน้ำแข็งและหยดน้ำ (Friction of Ice & Water Drops)",
  "เกิดจากอิทธิพลของสนามแม่เหล็กโลกโดยตรง (Geomagnetic Field Effect)",
  "เกิดจากการแผ่รังสีพลังงานสูงจากดวงอาทิตย์ (High Energy Solar Radiation)",
  "เกิดจากปฏิกิริยาเคมีของมลพิษในอากาศ (Air Pollution Chemical Reaction)"
], "เกิดจากการเสียดสีกันของผลึกน้ำแข็งและหยดน้ำ (Friction of Ice & Water Drops)");

// 63. Q91
updateQ(91, [
  "หมุนทวนเข็มนาฬิกาเข้าหาศูนย์กลาง (Counterclockwise Inward)",
  "หมุนตามเข็มนาฬิกาเข้าหาศูนย์กลาง (Clockwise Inward)",
  "หมุนทวนเข็มนาฬิกาออกจากศูนย์กลาง (Counterclockwise Outward)",
  "หมุนตามเข็มนาฬิกาออกจากศูนย์กลาง (Clockwise Outward)"
], "หมุนตามเข็มนาฬิกาเข้าหาศูนย์กลาง (Clockwise Inward)");

// 64. Q92
updateQ(92, [
  "การสังเกตลักษณะของเมฆด้วยสายตา (Visual Cloud Observation)",
  "การใช้เทอร์มอมิเตอร์และบารอมิเตอร์แบบดั้งเดิม (Conventional Instruments)",
  "แบบจำลองคอมพิวเตอร์เชิงตัวเลข (Numerical Weather Prediction: NWP)",
  "การสังเกตพฤติกรรมที่ผิดปกติของสัตว์ (Animal Behavior Observation)"
], "แบบจำลองคอมพิวเตอร์เชิงตัวเลข (Numerical Weather Prediction: NWP)");

// 65. Q93
updateQ(93, [
  "เป็นพลังงานที่ใช้ในการทำให้น้ำแข็งละลายกลายเป็นน้ำ (Latent Heat of Fusion)",
  "เป็นพลังงานที่ปลดปล่อยออกมาเมื่อไอน้ำควบแน่นเป็นเมฆ (Latent Heat of Condensation)",
  "เป็นพลังงานโดยตรงที่ทำให้อุณหภูมิของโลกสูงขึ้น (Sensible Heat Warming)",
  "เป็นพลังงานที่ทำให้อากาศเย็นลงเมื่อมีฝนตกลงมา (Rain Evaporative Cooling)"
], "เป็นพลังงานที่ปลดปล่อยออกมาเมื่อไอน้ำควบแน่นเป็นเมฆ (Latent Heat of Condensation)");

// 66. Q94
updateQ(94, [
  "จะสูงกว่าอุณหภูมิในปัจจุบันมาก (Much Warmer)",
  "จะต่ำกว่าปัจจุบันมากจนสิ่งมีชีวิตอยู่ไม่ได้ (Much Colder)",
  "จะไม่เปลี่ยนแปลงไปจากอุณหภูมิปัจจุบัน (Unchanged Temperature)",
  "จะเปลี่ยนแปลงในช่วงวันแต่ค่าเฉลี่ยเท่าเดิม (Diurnal Change Only)"
], "จะต่ำกว่าปัจจุบันมากจนสิ่งมีชีวิตอยู่ไม่ได้ (Much Colder)");

// 67. Q95
updateQ(95, [
  "เกิดจากแรงลมที่พัดผ่านพื้นผิวมหาสมุทร (Wind-driven Current)",
  "เกิดจากความแตกต่างของความหนาแน่นของน้ำทะเล (Density-driven Thermohaline Circulation)",
  "เกิดจากการหมุนรอบตัวเองของโลกโดยตรง (Coriolis Effect Direct)",
  "เกิดจากรูปร่างของทวีปที่กั้นทางเดินของน้ำ (Continental Deflection)"
], "เกิดจากความแตกต่างของความหนาแน่นของน้ำทะเล (Density-driven Thermohaline Circulation)");

// 68. Q96
updateQ(96, [
  "สภาพอากาศแห้ง, การเผา, และบรรยากาศมีเสถียรภาพ (Dry Climate, Burning, Stable Air)",
  "ลมมรสุมตะวันตกเฉียงใต้พัดพาควันจากแหล่งกำเนิด (Southwest Monsoon Transport)",
  "การเกิดพายุฤดูร้อนที่พัดพากลุ่มควันเข้ามา (Summer Storm Transport)",
  "อิทธิพลโดยตรงจากปรากฏการณ์ลานีญา (La Niña Direct Effect)"
], "สภาพอากาศแห้ง, การเผา, และบรรยากาศมีเสถียรภาพ (Dry Climate, Burning, Stable Air)");

// 69. Q98
updateQ(98, [
  "พฤษภาคม - ตุลาคม (May - October)",
  "พฤศจิกายน - เมษายน (November - April)",
  "กรกฎาคม - สิงหาคม (July - August)",
  "ทุกช่วงเวลามีโอกาสเท่ากัน (All Year Round)"
], "พฤศจิกายน - เมษายน (November - April)");

// 70. Q99
updateQ(99, [
  "สามารถถ่ายภาพความละเอียดสูงได้ทั่วทุกมุมโลก (Global High Resolution)",
  "สามารถเฝ้าสังเกตพื้นที่เดิมได้อย่างต่อเนื่อง (Continuous Fixed-area Monitoring)",
  "สามารถวัดอุณหภูมิผิวน้ำทะเลได้อย่างแม่นยำ (Accurate Sea Surface Temperature)",
  "สามารถบินผ่านขั้วโลกเพื่อเก็บข้อมูลได้ครอบคลุม (Polar Coverage)"
], "สามารถเฝ้าสังเกตพื้นที่เดิมได้อย่างต่อเนื่อง (Continuous Fixed-area Monitoring)");

// 71. Q100
updateQ(100, [
  "มวลอากาศอุ่นเคลื่อนที่เข้าแทนที่มวลอากาศเย็น (Warm Air Replacing Cold Air)",
  "แนวปะทะอากาศเย็นเคลื่อนที่ทันแนวปะทะอากาศอุ่น (Cold Front Overtaking Warm Front)",
  "มวลอากาศเย็นและอุ่นเคลื่อนที่ขนานกันไป (Parallel Air Mass Movement)",
  "มวลอากาศเย็นสองกลุ่มเคลื่อนที่มาบรรจบกัน (Two Cold Air Masses Meeting)"
], "แนวปะทะอากาศเย็นเคลื่อนที่ทันแนวปะทะอากาศอุ่น (Cold Front Overtaking Warm Front)");

// 72. Q101
updateQ(101, [
  "ระยะห่างระหว่างโลกกับดวงอาทิตย์ (Earth-Sun Distance)",
  "การเอียงของแกนหมุนโลก (Earth's Axial Tilt)",
  "การเกิดจุดดับบนดวงอาทิตย์ (Sunspot Activity)",
  "อิทธิพลจากดวงจันทร์บริวาร (Lunar Gravity Effect)"
], "การเอียงของแกนหมุนโลก (Earth's Axial Tilt)");

// 73. Q102
updateQ(102, [
  "ดาวสีแดง (Red Star)",
  "ดาวสีเหลือง (Yellow Star)",
  "ดาวสีขาว (White Star)",
  "ดาวสีน้ำเงิน (Blue Star)"
], "ดาวสีน้ำเงิน (Blue Star)");

// 74. Q103
updateQ(103, [
  "ปฏิกิริยานิวเคลียร์ฟิชชัน (Nuclear Fission)",
  "ปฏิกิริยานิวเคลียร์ฟิวชัน (Nuclear Fusion)",
  "การเผาไหม้ของเชื้อเพลิง (Chemical Combustion)",
  "การสลายตัวของธาตุกัมมันตรังสี (Radioactive Decay)"
], "ปฏิกิริยานิวเคลียร์ฟิวชัน (Nuclear Fusion)");

// 75. Q104
updateQ(104, [
  "เกิดจากดาวฤกษ์ตกลงมายังพื้นผิวโลก (Star Falling to Earth)",
  "เกิดจากดาวหางพุ่งเข้าชนชั้นบรรยากาศโลก (Comet Collision)",
  "เกิดจากชิ้นส่วนอุกกาบาตเผาไหม้ในบรรยากาศ (Meteoroid Burning)",
  "เกิดจากดาวเทียมหมดอายุการใช้งานตกลงมา (Satellite Reentry)"
], "เกิดจากชิ้นส่วนอุกกาบาตเผาไหม้ในบรรยากาศ (Meteoroid Burning)");

// 76. Q107
updateQ(107, [
  "ดวงจันทร์สามารถสร้างแสงสว่างได้ด้วยตัวเอง (Self-luminous Body)",
  "แสงจากดาวฤกษ์ดวงอื่นสะท้อนมายังดวงจันทร์ (Starlight Reflection)",
  "แสงสว่างจากโลกสะท้อนไปยังพื้นผิวดวงจันทร์ (Earthshine Reflection)",
  "แสงจากดวงอาทิตย์สะท้อนที่พื้นผิวดวงจันทร์ (Sunlight Reflection)"
], "แสงจากดวงอาทิตย์สะท้อนที่พื้นผิวดวงจันทร์ (Sunlight Reflection)");

// 77. Q110
updateQ(110, [
  "แถบดาวเคราะห์น้อย (Asteroid Belt)",
  "แถบไคเปอร์ (Kuiper Belt)",
  "เมฆออร์ต (Oort Cloud)",
  "วงแหวนของดาวเสาร์ (Saturn's Rings)"
], "เมฆออร์ต (Oort Cloud)");

// 78. Q112
updateQ(112, [
  "ดาว A อยู่ไกลกว่าดาว B (Star A is farther)",
  "ดาว B อยู่ไกลกว่าดาว A (Star B is farther)",
  "ดาว A และ B อยู่ห่างจากโลกเท่ากัน (Equal Distance)",
  "ข้อมูลไม่เพียงพอที่จะสรุปได้ (Insufficient Data)"
], "ดาว B อยู่ไกลกว่าดาว A (Star B is farther)");

// 79. Q113
updateQ(113, [
  "จะยุบตัวลงเป็นดาวแคระขาวอย่างสงบ (White Dwarf)",
  "จะระเบิดเป็นซูเปอร์โนวาและเหลือดาวนิวตรอน (Supernova & Neutron Star)",
  "จะกลายเป็นดาวยักษ์แดงแล้วค่อยๆ สลายไป (Red Giant Dissipation)",
  "จะไม่มีการเปลี่ยนแปลงใดๆ เกิดขึ้นกับดาว (No Evolution Change)"
], "จะระเบิดเป็นซูเปอร์โนวาและเหลือดาวนิวตรอน (Supernova & Neutron Star)");

// 80. Q114
updateQ(114, [
  "เคลื่อนที่เข้าหาเรา สนับสนุนทฤษฎีบิกแบง (Moving Closer, Big Bang Theory)",
  "เคลื่อนที่ออกจากเรา สนับสนุนทฤษฎีบิกแบง (Moving Away, Big Bang Theory)",
  "เคลื่อนที่เข้าหาเรา สนับสนุนทฤษฎีสภาวะคงที่ (Moving Closer, Steady State Theory)",
  "เคลื่อนที่ออกจากเรา สนับสนุนทฤษฎีสภาวะคงที่ (Moving Away, Steady State Theory)"
], "เคลื่อนที่ออกจากเรา สนับสนุนทฤษฎีบิกแบง (Moving Away, Big Bang Theory)");

// 81. Q115
updateQ(115, [
  "ที่ขอบฟ้าทางทิศเหนือ (North Horizon)",
  "ที่จุดเหนือศีรษะ (Zenith Point)",
  "ทำมุม 45 องศากับขอบฟ้า (45 Degrees Altitude)",
  "ไม่สามารถมองเห็นได้ (Below Horizon)"
], "ที่จุดเหนือศีรษะ (Zenith Point)");

// 82. Q116
updateQ(116, [
  "ดาวดวงนี้อยู่ห่างจากโลกน้อยกว่า 10 พาร์เซก (Distance < 10 pc)",
  "ดาวดวงนี้อยู่ห่างจากโลกเท่ากับ 10 พาร์เซก (Distance = 10 pc)",
  "ดาวดวงนี้อยู่ห่างจากโลกมากกว่า 10 พาร์เซก (Distance > 10 pc)",
  "ดาวดวงนี้มีความสว่างน้อยกว่าดวงอาทิตย์ (Luminosity Less Than Sun)"
], "ดาวดวงนี้อยู่ห่างจากโลกมากกว่า 10 พาร์เซก (Distance > 10 pc)");

// 83. Q117
updateQ(117, [
  "ดวงจันทร์ไม่มีการหมุนรอบตัวเองเลย (No Rotation)",
  "คาบการหมุนรอบตัวเองเท่ากับคาบการโคจรรอบโลก (Synchronous Rotation)",
  "ด้านมืดของดวงจันทร์ไม่สามารถสะท้อนแสงได้ (Non-reflective Dark Side)",
  "แรงโน้มถ่วงของโลกบังคับให้หันด้านเดียวเข้าหา (Gravitational Lock Only)"
], "คาบการหมุนรอบตัวเองเท่ากับคาบการโคจรรอบโลก (Synchronous Rotation)");

// 84. Q118
updateQ(118, [
  "น้ำเกิด (Spring Tide)",
  "น้ำตาย (Neap Tide)",
  "น้ำขึ้นสูงสุด (High High Water)",
  "น้ำลงต่ำสุด (Low Low Water)"
], "น้ำเกิด (Spring Tide)");

// 85. Q119
updateQ(119, [
  "เป็นสสารที่ไม่เปล่งแสงแต่มีแรงโน้มถ่วง (Non-luminous Gravitational Matter)",
  "เป็นอีกชื่อหนึ่งที่ใช้เรียกหลุมดำ (Another Name for Black Hole)",
  "เป็นฝุ่นและแก๊สที่บดบังแสงดาวฤกษ์ (Interstellar Dust & Gas)",
  "เป็นสสารที่ผลักให้เอกภพขยายตัว (Accelerating Expansion Energy)"
], "เป็นสสารที่ไม่เปล่งแสงแต่มีแรงโน้มถ่วง (Non-luminous Gravitational Matter)");

// 86. Q121
updateQ(121, [
  "ดาวเคราะห์อยู่ใกล้ดาวฤกษ์แม่มากกว่าโลก (Closer to Host Star)",
  "ดาวเคราะห์อยู่ไกลดาวฤกษ์แม่มากกว่าโลก (Farther from Host Star)",
  "ดาวเคราะห์มีขนาดใหญ่กว่าโลกมาก (Much Larger Radius)",
  "ดาวเคราะห์มีมวลมากกว่าโลกมาก (Much Larger Mass)"
], "ดาวเคราะห์อยู่ใกล้ดาวฤกษ์แม่มากกว่าโลก (Closer to Host Star)");

// 87. Q122
updateQ(122, [
  "ดวงจันทร์อยู่ระหว่างโลกกับดวงอาทิตย์ในคืนวันเพ็ญ (Full Moon Conjunction)",
  "โลกอยู่ระหว่างดวงจันทร์กับดวงอาทิตย์ในวันแรม 15 ค่ำ (New Moon Opposition)",
  "ดวงจันทร์บังดวงอาทิตย์ในวันแรม 15 ค่ำ และอยู่ในแนวเดียวกัน (New Moon Alignment)",
  "ดวงจันทร์โคจรไปบดบังดาวฤกษ์ดวงอื่นที่ไม่ใช่ดวงอาทิตย์ (Stellar Occultation)"
], "ดวงจันทร์บังดวงอาทิตย์ในวันแรม 15 ค่ำ และอยู่ในแนวเดียวกัน (New Moon Alignment)");

// 88. Q123
updateQ(123, [
  "การมีอยู่ของหลุมดำใจกลางกาแล็กซี (Supermassive Black Hole)",
  "การขยายตัวด้วยอัตราเร่งของเอกภพ (Accelerating Universe Expansion)",
  "เลนส์ความโน้มถ่วงจากมวลมหาศาล (Gravitational Lensing Effect)",
  "การเกิดคลื่นความโน้มถ่วงจากการชนกัน (Gravitational Wave Event)"
], "เลนส์ความโน้มถ่วงจากมวลมหาศาล (Gravitational Lensing Effect)");

// 89. Q124
updateQ(124, [
  "อยู่ไกลจากดวงอาทิตย์ ทำให้สสารเบาสามารถรวมตัวกันได้ (Beyond Frost Line)",
  "ก่อตัวขึ้นมาก่อนดาวเคราะห์ชั้นในจะเริ่มก่อตัว (Earlier Planetary Formation)",
  "มีแรงโน้มถ่วงที่สูงกว่าดาวเคราะห์ชั้นในตั้งแต่แรกเริ่ม (Initial Strong Gravity)",
  "เกิดจากการชนและรวมตัวกันของดาวเคราะห์น้อยจำนวนมาก (Asteroid Collision Accumulation)"
], "อยู่ไกลจากดวงอาทิตย์ ทำให้สสารเบาสามารถรวมตัวกันได้ (Beyond Frost Line)");

// 90. Q126
updateQ(126, [
  "เป็นบริเวณที่ดาวเคราะห์มีสนามแม่เหล็กป้องกันรังสี (Magnetic Shield Zone)",
  "เป็นบริเวณที่ดาวเคราะห์จะถูกล็อกด้วยแรงไทดัล (Tidal Lock Zone)",
  "เป็นบริเวณที่น้ำสามารถคงสถานะของเหลวบนพื้นผิวได้ (Liquid Water Zone)",
  "เป็นบริเวณที่ดาวเคราะห์ปลอดภัยจากการชนของอุกกาบาต (Impact Safe Zone)"
], "เป็นบริเวณที่น้ำสามารถคงสถานะของเหลวบนพื้นผิวได้ (Liquid Water Zone)");

// 91. Q127
updateQ(127, [
  "ดาว A อยู่ใกล้โลกกว่าดาว B (Star A is Closer)",
  "ดาว B อยู่ใกล้โลกกว่าดาว A (Star B is Closer)",
  "ดาว A มีอุณหภูมิสูงกว่าดาว B (Star A is Hotter)",
  "ดาว A มีขนาดใหญ่กว่าดาว B (Star A is Larger)"
], "ดาว A อยู่ใกล้โลกกว่าดาว B (Star A is Closer)");

// 92. Q129
updateQ(129, [
  "ไม่เห็นความเปลี่ยนแปลงใดๆ บนท้องฟ้า (No Observable Change)",
  "เห็นโลกเคลื่อนที่มาบังดวงอาทิตย์ (Earth Occulting the Sun)",
  "เห็นเงาของตัวเองทอดไปบนพื้นผิวโลก (Shadow Cast on Earth)",
  "เห็นโลกสว่างเต็มดวงขึ้นกว่าปกติ (Fully Illuminated Earth)"
], "เห็นโลกเคลื่อนที่มาบังดวงอาทิตย์ (Earth Occulting the Sun)");

// 93. Q130
updateQ(130, [
  "การศึกษาวิวัฒนาการของดาวฤกษ์ (Stellar Evolution Study)",
  "การวัดระยะทางไปยังกาแล็กซีอื่น (Extragalactic Distance Measurement)",
  "การค้นหาดาวเคราะห์นอกระบบสุริยะ (Exoplanet Discovery)",
  "การตรวจจับคลื่นความโน้มถ่วง (Gravitational Wave Detection)"
], "การวัดระยะทางไปยังกาแล็กซีอื่น (Extragalactic Distance Measurement)");

// 94. Q131
updateQ(131, [
  "อยู่ใกล้กับแถบดาวเคราะห์น้อยมากกว่าดาวเคราะห์ดวงอื่น (Proximity to Asteroid Belt)",
  "ไม่มีบรรยากาศและกระบวนการทางธรณีวิทยาที่จะลบร่องรอย (Lack of Atmosphere & Erosion)",
  "มีแรงโน้มถ่วงสูงจึงสามารถดึงดูดอุกกาบาตได้ดี (High Surface Gravity Attraction)",
  "เคยมีน้ำจำนวนมากอยู่บนพื้นผิวในอดีต (Ancient Surface Water Erosion)"
], "ไม่มีบรรยากาศและกระบวนการทางธรณีวิทยาที่จะลบร่องรอย (Lack of Atmosphere & Erosion)");

// 95. Q132
updateQ(132, [
  "กำลังเคลื่อนที่เข้าหาดวงอาทิตย์โดยตรง (Moving Directly Toward Sun)",
  "กำลังเคลื่อนที่ออกจากดวงอาทิตย์โดยตรง (Moving Directly Away from Sun)",
  "กำลังเคลื่อนที่ขนานไปกับดวงอาทิตย์ (Moving Parallel to Sun)",
  "ไม่สามารถสรุปทิศทางได้ แต่ดวงอาทิตย์อยู่ทางตะวันตก (Sun Positioned Westward)"
], "ไม่สามารถสรุปทิศทางได้ แต่ดวงอาทิตย์อยู่ทางตะวันตก (Sun Positioned Westward)");

// 96. Q133
updateQ(133, [
  "มีขนาดที่เล็กเกินกว่าจะเป็นดาวเคราะห์ (Sub-planetary Size)",
  "มีวงโคจรที่เป็นวงรีมากเกินไป (Highly Eccentric Orbit)",
  "ไม่สามารถควบคุมแรงโน้มถ่วงในวงโคจรได้ (Failed Clearing Neighborhood)",
  "ไม่มีดวงจันทร์บริวารเป็นของตัวเอง (Lack of Satellite System)"
], "ไม่สามารถควบคุมแรงโน้มถ่วงในวงโคจรได้ (Failed Clearing Neighborhood)");

// 97. Q134
updateQ(134, [
  "การเกิดจุดดับบนพื้นผิวดวงอาทิตย์ (Sunspot Activity)",
  "การลุกจ้าและการปลดปล่อยมวลของโคโรนา (Solar Flare & CME)",
  "การเกิดแกรนูลบนพื้นผิวดวงอาทิตย์ (Solar Granulation)",
  "การหมุนรอบตัวเองที่แตกต่างกันของดวงอาทิตย์ (Differential Rotation)"
], "การลุกจ้าและการปลดปล่อยมวลของโคโรนา (Solar Flare & CME)");

// 98. Q135
updateQ(135, [
  "อยู่ในช่วงกำลังก่อกำเนิดจากเนบิวลา (Protostar Stage)",
  "อยู่ในช่วงเผาผลาญไฮโดรเจนที่แกนกลาง (Core Hydrogen Burning)",
  "อยู่ในช่วงที่ใกล้จะสิ้นสุดอายุขัยของดาว (Late Life Stage)",
  "อยู่ในช่วงหลังจากการระเบิดซูเปอร์โนวา (Post-Supernova Remnant)"
], "อยู่ในช่วงเผาผลาญไฮโดรเจนที่แกนกลาง (Core Hydrogen Burning)");

// 99. Q136
updateQ(136, [
  "เป็นแสงสะท้อนจากดาวเคราะห์ต่างๆ ในระบบสุริยะ (Planetary Light Reflection)",
  "เป็นกลุ่มของดาวฤกษ์ที่อยู่ใกล้โลกเป็นพิเศษ (Nearby Star Concentration)",
  "เป็นมุมมองที่เรามองเข้าไปในระนาบของกาแล็กซี (View Along Galactic Plane)",
  "เป็นแสงสว่างจากกาแล็กซีแอนโดรเมดาที่อยู่ใกล้เคียง (Andromeda Galaxy Light)"
], "เป็นมุมมองที่เรามองเข้าไปในระนาบของกาแล็กซี (View Along Galactic Plane)");

// 100. Q137
updateQ(137, [
  "จะไม่มีการเปลี่ยนแปลงของฤดูกาลบนโลก (No Seasonal Change)",
  "แกนหมุนของโลกจะไม่มีเสถียรภาพและเปลี่ยนแปลงได้ (Unstable Axial Tilt)",
  "จะไม่มีการเกิดสนามแม่เหล็กโลกขึ้นมา (No Geomagnetic Field)",
  "ระยะเวลาหนึ่งวันบนโลกจะยาวนานขึ้นมาก (Extremely Long Day Length)"
], "แกนหมุนของโลกจะไม่มีเสถียรภาพและเปลี่ยนแปลงได้ (Unstable Axial Tilt)");

// 101. Q138
updateQ(138, [
  "เพื่อใช้วัดอุณหภูมิพื้นผิวของดาวฤกษ์ (Stellar Temperature Measurement)",
  "เพื่อค้นหาดาวเคราะห์นอกระบบด้วยวิธีผ่านหน้า (Transit Method Exoplanet Search)",
  "เพื่อใช้วัดระยะห่างไปยังดาวฤกษ์ดวงนั้น (Stellar Distance Measurement)",
  "เพื่อศึกษาองค์ประกอบทางเคมีของดาวฤกษ์ (Stellar Composition Study)"
], "เพื่อค้นหาดาวเคราะห์นอกระบบด้วยวิธีผ่านหน้า (Transit Method Exoplanet Search)");

// 102. Q139
updateQ(139, [
  "ดาวเคราะห์น้อยมีวงโคจรเป็นวงรี, ดาวหางมีวงโคจรกลม (Elliptic vs Circular Orbit)",
  "ดาวเคราะห์น้อยเป็นหินและโลหะ, ดาวหางเป็นน้ำแข็งและฝุ่น (Rocky/Metallic vs Icy/Dusty Composition)",
  "ดาวเคราะห์น้อยพบในแถบดาวเคราะห์น้อย, ดาวหางพบได้ทั่วไป (Asteroid Belt vs Distributed)",
  "ดาวเคราะห์น้อยมีขนาดใหญ่กว่า, ดาวหางมีขนาดเล็กกว่า (Larger vs Smaller Size)"
], "ดาวเคราะห์น้อยเป็นหินและโลหะ, ดาวหางเป็นน้ำแข็งและฝุ่น (Rocky/Metallic vs Icy/Dusty Composition)");

// 103. Q140
updateQ(140, [
  "จุดใจกลางของหลุมดำและจุดเริ่มต้นของเอกภพ (Infinite Density Point)",
  "สภาวะที่เอกภพจะยุบตัวกลับมาเป็นจุดเดียวอีกครั้ง (Big Crunch State)",
  "ขอบเขตของหลุมดำที่ไม่สามารถกลับออกมาได้ (Point of No Return Boundary)",
  "พลังงานที่ผลักดันให้เอกภพขยายตัวด้วยอัตราเร่ง (Accelerating Expansion Energy)"
], "จุดใจกลางของหลุมดำและจุดเริ่มต้นของเอกภพ (Infinite Density Point)");

// 104. Q141
updateQ(141, [
  "ดวงจันทร์ดับทั้งดวง (New Moon)",
  "ดวงจันทร์ครึ่งดวงข้างแรม (Third Quarter)",
  "ดวงจันทร์เต็มดวงหรือจันทร์เพ็ญ (Full Moon)",
  "ดวงจันทร์ครึ่งดวงข้างขึ้น (First Quarter)"
], "ดวงจันทร์ครึ่งดวงข้างแรม (Third Quarter)");

// 105. Q142
updateQ(142, [
  "ดาวเคราะห์จะโคจรเร็วขึ้นเมื่ออยู่ใกล้ดวงอาทิตย์ (Faster Speed at Perihelion)",
  "วงโคจรของดาวเคราะห์ทุกดวงมีลักษณะเป็นวงรี (Elliptical Orbit Law)",
  "คาบการโคจรรอบดวงอาทิตย์สัมพันธ์กับระยะห่าง (Harmonic Period-Distance Law)",
  "ดาวเคราะห์ทุกดวงโคจรอยู่ในระนาบเดียวกันเสมอ (Coplanar Orbital Plane)"
], "ดาวเคราะห์จะโคจรเร็วขึ้นเมื่ออยู่ใกล้ดวงอาทิตย์ (Faster Speed at Perihelion)");

// 106. Q143
updateQ(143, [
  "เรากำลังเห็นภาพของดาวฤกษ์ดวงนั้นในอดีต (Observing the Past Image)",
  "ดาวฤกษ์ดวงนั้นกำลังเคลื่อนที่เข้าหาเราด้วยความเร็วสูง (Moving Toward Us)",
  "แสงจากดาวฤกษ์นั้นเดินทางมาถึงโลกได้ในทันที (Instantaneous Light Travel)",
  "ดาวฤกษ์ดวงนั้นมีอุณหภูมิต่ำกว่าดวงอาทิตย์เสมอ (Cooler Than the Sun)"
], "เรากำลังเห็นภาพของดาวฤกษ์ดวงนั้นในอดีต (Observing the Past Image)");

// 107. Q144
updateQ(144, [
  "เกิดจากการสะท้อนแสงของดวงจันทร์ที่ขั้วโลก (Lunar Light Reflection)",
  "เกิดจากลมสุริยะทำปฏิกิริยากับสนามแม่เหล็กโลก (Solar Wind & Geomagnetic Interaction)",
  "เกิดจากการเผาไหม้ของอุกกาบาตในบรรยากาศ (Meteor Burning Effect)",
  "เกิดจากการปล่อยมลพิษจากโรงงานอุตสาหกรรม (Industrial Pollution Glow)"
], "เกิดจากลมสุริยะทำปฏิกิริยากับสนามแม่เหล็กโลก (Solar Wind & Geomagnetic Interaction)");

// 108. Q145
updateQ(145, [
  "เป็นดาวฤกษ์อายุน้อย สีน้ำเงิน (Young Blue Stars)",
  "เป็นดาวฤกษ์อายุมาก สีแดงและเหลือง (Old Red & Yellow Stars)",
  "มีองค์ประกอบเป็นธาตุหนักในปริมาณสูง (High Metal Abundance)",
  "อยู่ในระนาบดิสก์ของกาแล็กซี (Galactic Disk Population)"
], "เป็นดาวฤกษ์อายุมาก สีแดงและเหลือง (Old Red & Yellow Stars)");

// 109. Q147
updateQ(147, [
  "ดาวเคราะห์ปรากฏเป็นแผ่นวงกลม ทำให้แสงถูกรบกวนน้อยกว่า (Disk Appearance Reduces Turbulence)",
  "ดาวเคราะห์เป็นแสงสะท้อน แต่ดาวฤกษ์เป็นแสงที่สร้างเอง (Reflected Light vs Self-luminous)",
  "ดาวเคราะห์มีแสงที่นิ่งและสม่ำเสมอกว่าดาวฤกษ์ (Constant Luminous Output)",
  "บรรยากาศของโลกไม่ส่งผลกระทบต่อแสงจากดาวเคราะห์ (Atmosphere Immune Light)"
], "ดาวเคราะห์ปรากฏเป็นแผ่นวงกลม ทำให้แสงถูกรบกวนน้อยกว่า (Disk Appearance Reduces Turbulence)");

// 110. Q148
updateQ(148, [
  "ขอบเขตของเอกภพที่มนุษย์สามารถสังเกตได้ (Observable Universe Boundary)",
  "ขอบเขตของหลุมดำที่แม้แต่แสงก็ไม่สามารถหนีออกมาได้ (Black Hole Boundary)",
  "จุดที่ดาวฤกษ์เริ่มเข้าสู่ช่วงวิวัฒนาการสุดท้าย (Late Stellar Evolution Point)",
  "วงโคจรของดาวเคราะห์ที่อยู่ไกลที่สุดในระบบสุริยะ (Outermost Planet Orbit)"
], "ขอบเขตของหลุมดำที่แม้แต่แสงก็ไม่สามารถหนีออกมาได้ (Black Hole Boundary)");

// 111. Q149
updateQ(149, [
  "สามารถสังเกตเห็นหลุมดำได้โดยตรงด้วยกล้องโทรทรรศน์ (Direct Telescope Observation)",
  "สังเกตการโคจรของดาวฤกษ์รอบใจกลางด้วยความเร็วสูง (High Speed Stellar Orbit)",
  "สามารถตรวจจับสัญญาณวิทยุที่ปล่อยออกมาจากหลุมดำ (Direct Radio Emission)",
  "พบว่าบริเวณใจกลางกาแล็กซีไม่มีดาวฤกษ์อยู่เลย (Empty Center Void)"
], "สังเกตการโคจรของดาวฤกษ์รอบใจกลางด้วยความเร็วสูง (High Speed Stellar Orbit)");

// 112. Q150
updateQ(150, [
  "เกิดการเลื่อนไปทางสีแดง (Redshift)",
  "เกิดการเลื่อนไปทางสีน้ำเงิน (Blueshift)",
  "ไม่มีการเปลี่ยนแปลงของสเปกตรัม (No Spectral Shift)",
  "เส้นสเปกตรัมจะหายไปทั้งหมด (Spectrum Disappear)"
], "เกิดการเลื่อนไปทางสีน้ำเงิน (Blueshift)");

// Serialize back to ES2-data.js format
const fileHeader = `export const quizItems = `;
const fileContent = fileHeader + JSON.stringify(updatedQuizItems, null, 2) + `;\n`;

fs.writeFileSync('data/posn_earth/ES2-data.js', fileContent);
console.log('Successfully updated ES2-data.js!');
