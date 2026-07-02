import re
import json
import urllib.parse

# Path to the source file
source_file = "d:/de-thi/link-tai_khao-sat-ve-do-thi-ham-so.txt"

# Translation dictionary to map slugs to clean Vietnamese titles
mappings = [
    ("le-quang-xe", "Thầy Lê Quang Xe"),
    ("le-van-doan", "Thầy Lê Văn Đoàn"),
    ("tran-ba-sao", "Thầy Trần Bá Sào"),
    ("diep-tuan", "Thầy Diệp Tuân"),
    ("vo-cong-truong", "Thầy Võ Công Trường"),
    ("nguyen-vu-minh", "Thầy Nguyễn Vũ Minh"),
    ("tran-thanh-yen", "Cô Trần Thanh Yến"),
    ("dang-viet-dong", "Thầy Đặng Việt Đông"),
    
    ("canh-dieu", "Cánh Diều"),
    ("ctst", "Chân Trời Sáng Tạo"),
    ("knttvcs", "Kết Nối Tri Thức"),
    ("chuong-trinh-moi", "Chương trình mới"),
    ("cau-truc-moi", "Cấu trúc mới"),
    
    ("30-de-tong-on-tap-chuong-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "30 Đề tổng ôn tập chương Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    ("bo-de-on-tap-chuong-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "Bộ đề ôn tập chương Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    ("bo-de-on-tap-mon-toan-12-chu-de-khao-sat-va-ve-do-thi-cua-ham-so", "Bộ đề ôn tập môn Toán 12 - Chủ đề khảo sát và vẽ đồ thị của hàm số"),
    ("luyen-ky-nang-trac-nghiem-dung-sai-tong-hop-chu-de-khao-sat-ham-so", "Luyện kỹ năng trắc nghiệm đúng sai tổng hợp - Chủ đề Khảo sát hàm số"),
    ("luyen-ky-nang-ung-dung-ham-so-giai-bai-toan-thuc-te", "Luyện kỹ năng ứng dụng hàm số giải bài toán thực tế"),
    ("mot-so-bai-toan-thuc-te-lien-quan-den-khao-sat-ham-so-toan-12-phan-1", "Một số bài toán thực tế liên quan đến khảo sát hàm số - Toán 12 (Phần 1)"),
    ("nam-tron-chuyen-de-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so-toan-12", "Nắm trọn chuyên đề Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số - Toán 12"),
    ("toan-tap-khao-sat-ham-so-va-ung-dung-mon-toan-12-thpt", "Toàn tập khảo sát hàm số và ứng dụng - Môn Toán 12 THPT"),
    ("tong-hop-toan-thuc-te-dung-sai-va-tra-loi-ngan-chu-de-gtln-gtnn-cua-ham-so", "Tổng hợp toán thực tế đúng sai và trả lời ngắn - Chủ đề GTLN/GTNN của hàm số"),
    
    ("de-kiem-tra-theo-bai-hoc-chu-de-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "Đề kiểm tra theo bài học - Chủ đề Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    ("de-kiem-tra-theo-bai-hoc-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "Đề kiểm tra theo bài học - Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    ("cac-dang-bai-tap-duong-tiem-can-cua-do-thi-ham-so", "Các dạng bài tập Đường tiệm cận của đồ thị hàm số"),
    ("cac-dang-bai-tap-gia-tri-lon-nhat-gia-tri-nho-nhat-cua-ham-so", "Các dạng bài tập Giá trị lớn nhất và Giá trị nhỏ nhất của hàm số"),
    ("cac-dang-bai-tap-gia-tri-lon-nhat-va-gia-tri-nho-nhat-cua-ham-so", "Các dạng bài tập Giá trị lớn nhất và Giá trị nhỏ nhất của hàm số"),
    ("cac-dang-bai-tap-khao-sat-su-bien-thien-va-ve-do-thi-cua-ham-so", "Các dạng bài tập Khảo sát sự biến thiên và vẽ đồ thị của hàm số"),
    ("cac-dang-bai-tap-khao-sat-su-bien-thien-va-ve-do-thi-ham-so", "Các dạng bài tập Khảo sát sự biến thiên và vẽ đồ thị hàm số"),
    ("cac-dang-bai-tap-khao-sat-va-ve-do-thi-mot-so-ham-so-co-ban", "Các dạng bài tập Khảo sát và vẽ đồ thị một số hàm số cơ bản"),
    ("cac-dang-bai-tap-tinh-don-dieu-cua-ham-so", "Các dạng bài tập Tính đơn điệu của hàm số"),
    ("cac-dang-bai-tap-tinh-don-dieu-va-cuc-tri-cua-ham-so", "Các dạng bài tập Tính đơn điệu và cực trị của hàm số"),
    ("cac-dang-bai-tap-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "Các dạng bài tập Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    ("on-kien-thuc-luyen-ky-nang-bai-giang-cuc-tri-cua-ham-so", "Ôn kiến thức luyện kỹ năng - Bài giảng Cực trị của hàm số"),
    ("on-kien-thuc-luyen-ky-nang-bai-giang-do-thi-bang-bien-thien-cua-ham-so", "Ôn kiến thức luyện kỹ năng - Bài giảng Đồ thị bảng biến thiên của hàm số"),
    ("on-kien-thuc-luyen-ky-nang-bai-giang-duong-tiem-can-cua-do-thi-ham-so", "Ôn kiến thức luyện kỹ năng - Bài giảng Đường tiệm cận của đồ thị hàm số"),
    ("on-kien-thuc-luyen-ky-nang-bai-giang-gtln-gtnn-cua-ham-so", "Ôn kiến thức luyện kỹ năng - Bài giảng GTLN/GTNN của hàm số"),
    ("on-kien-thuc-luyen-ky-nang-bai-giang-tinh-don-dieu-cua-ham-so", "Ôn kiến thức luyện kỹ năng - Bài giảng Tính đơn điệu của hàm số"),
    
    ("chuyen-de-duong-tiem-can-cua-do-thi-ham-so-tu-co-ban-den-nang-cao", "Chuyên đề Đường tiệm cận của đồ thị hàm số (Từ cơ bản đến nâng cao)"),
    ("chuyen-de-gia-tri-lon-nhat-va-gia-tri-nho-nhat-cua-ham-so-tu-co-ban-den-nang-cao", "Chuyên đề Giá trị lớn nhất và Giá trị nhỏ nhất của hàm số (Từ cơ bản đến nâng cao)"),
    ("chuyen-de-khao-sat-su-bien-thien-va-ve-do-thi-ham-so-tu-co-ban-den-nang-cao", "Chuyên đề Khảo sát sự biến thiên và vẽ đồ thị hàm số (Từ cơ bản đến nâng cao)"),
    ("chuyen-de-tinh-don-dieu-va-cuc-tri-cua-ham-so-tu-co-ban-den-nang-cao", "Chuyên đề Tính đơn điệu và cực trị của hàm số (Từ cơ bản đến nâng cao)"),
    
    ("chuyen-de-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-cua-ham-so", "Chuyên đề Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số"),
    ("chuyen-de-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "Chuyên đề Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    ("chuyen-de-cuc-tri-cua-ham-so-mon-toan-12", "Chuyên đề Cực trị của hàm số - Toán 12"),
    ("chuyen-de-tinh-don-dieu-cua-ham-so-mon-toan-12", "Chuyên đề Tính đơn điệu của hàm số - Toán 12"),
    
    ("tai-lieu-hoc-tap-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-cua-ham-so", "Tài liệu học tập Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số"),
    ("tai-lieu-hoc-tap-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "Tài liệu học tập Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    ("tai-lieu-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-cua-ham-so", "Tài liệu Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số"),
    ("tai-lieu-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "Tài liệu Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    
    ("toan-thuc-te-ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "Toán thực tế - Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    ("toan-thuc-te-ung-dung-dao-ham-va-khao-sat-ham-so", "Toán thực tế - Ứng dụng đạo hàm và khảo sát hàm số"),
    
    ("trac-nghiem-va-tu-luan-chu-de-duong-tiem-can-cua-do-thi-ham-so", "Trắc nghiệm và tự luận - Chủ đề Đường tiệm cận của đồ thị hàm số"),
    ("trac-nghiem-va-tu-luan-chu-de-gia-tri-lon-nhat-va-gia-tri-nho-nhat-cua-ham-so", "Trắc nghiệm và tự luận - Chủ đề Giá trị lớn nhất và Giá trị nhỏ nhất của hàm số"),
    ("trac-nghiem-va-tu-luan-chu-de-khao-sat-su-bien-thien-va-ve-do-thi-ham-so", "Trắc nghiệm và tự luận - Chủ đề Khảo sát sự biến thiên và vẽ đồ thị hàm số"),
    ("trac-nghiem-va-tu-luan-chu-de-tinh-don-dieu-va-cuc-tri-cua-ham-so", "Trắc nghiệm và tự luận - Chủ đề Tính đơn điệu và cực trị của hàm số"),
    
    ("ung-dung-dao-ham-de-khao-sat-ham-so", "Ứng dụng đạo hàm để khảo sát hàm số"),
    ("ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-ham-so", "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số"),
    ("ung-dung-dao-ham-de-khao-sat-va-ve-do-thi-cua-ham-so", "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số"),
    ("dinh-huong", "định hướng"),
    ("thuc-te-ve-ham-so", "thực tế về hàm số"),

    ("bai-giang", "Bài giảng"),
    ("bai-tap", "Bài tập"),
    ("bai-toan", "Bài toán"),
    ("chuyen-de", "Chuyên đề"),
    ("tai-lieu", "Tài liệu"),
    ("trac-nghiem", "Trắc nghiệm"),
    ("toan-12", "Toán 12"),
    ("mon-toan-12", "Môn Toán 12"),
    ("toan-thpt", "Toán THPT"),
]

def clean_filename_to_title(filename):
    base_name = re.sub(r"\.[pP][dD][fF]$", "", filename)
    
    # 0. Check for exact full name matches first
    for slug, text in mappings:
        if slug == base_name:
            return text
            
    result = base_name
    matched_parts = {}
    
    # 1. Substitute slugs with custom non-alphabetic/non-hyphen placeholders (longest first)
    for slug, text in sorted(mappings, key=lambda x: len(x[0]), reverse=True):
        if slug in result:
            placeholder = f"XPHX{len(matched_parts)}"
            matched_parts[placeholder] = text
            result = result.replace(slug, placeholder)
            
    # 2. Replace hyphens and underscores in remaining text
    result = result.replace("-", " ").replace("_", " ")
    
    # 3. Replace placeholders back with high-quality Vietnamese text
    for placeholder, text in matched_parts.items():
        result = result.replace(placeholder, text)
        
    # 4. Clean up spacing
    result = re.sub(r"\s+", " ", result).strip()
    
    # 5. Capitalize first letter
    if len(result) > 0:
        result = result[0].upper() + result[1:]
        
    # 6. Apply premium layout styling (colons, brackets, and dashes)
    result = result.replace(" Toan 12", " Toán 12")
    result = result.replace(" toan 12", " Toán 12")
    
    # Ensure space around dashes
    if "Toán 12" in result and " - Toán 12" not in result and "Môn Toán 12" not in result and "môn Toán 12" not in result:
        result = result.replace("Toán 12", " - Toán 12")
        
    result = result.replace(" Chân Trời Sáng Tạo", " (Chân Trời Sáng Tạo)")
    result = result.replace(" Cánh Diều", " (Cánh Diều)")
    result = result.replace(" Kết Nối Tri Thức", " (Kết Nối Tri Thức)")
    
    # Clean up double dashes or spaces
    result = result.replace(" - - ", " - ")
    result = result.replace(" -- ", " - ")
    result = re.sub(r"\(\s+", "(", result)
    result = re.sub(r"\s+\)", ")", result)
    result = result.replace(" - -", " -")
    result = result.replace("- - ", "- ")
    
    # Prefix formatting: "Category: Detailed Name"
    for prefix in ["Bài giảng", "Chuyên đề", "Tài liệu", "Bài tập", "Bài toán", "Đề thi", "Các dạng bài tập", "Bộ đề ôn tập", "30 Đề tổng ôn tập", "Luyện kỹ năng", "Toàn tập", "Trắc nghiệm và tự luận", "Đề kiểm tra theo bài học"]:
        if result.startswith(prefix) and not result.startswith(prefix + ":"):
            rest = result[len(prefix):].strip()
            # Clean up trailing dashes from prefix e.g. " - " or "-"
            if rest.startswith("-"):
                rest = rest[1:].strip()
            result = prefix + ": " + rest
            
    # Strip any double spaces again
    result = re.sub(r"\s+", " ", result).strip()
    
    return result

def get_category(filename):
    fn_lower = filename.lower()
    if "de-kiem-tra" in fn_lower or "bo-de-on" in fn_lower or "de-tong-on" in fn_lower or "de-thi" in fn_lower:
        return "Đề thi & Kiểm tra"
    elif "bai-giang" in fn_lower or "on-kien-thuc" in fn_lower or "ly-thuyet" in fn_lower:
        return "Bài giảng & Lý thuyết"
    elif "trac-nghiem" in fn_lower:
        return "Trắc nghiệm"
    elif "chuyen-de" in fn_lower or "cac-dang" in fn_lower or "bai-tap" in fn_lower or "tai-lieu" in fn_lower:
        return "Chuyên đề & Bài tập"
    else:
        return "Tài liệu tham khảo"

def get_tags(filename):
    fn_lower = filename.lower()
    tags = ["Toán 12"]
    if "ctst" in fn_lower:
        tags.append("Chân Trời Sáng Tạo")
    elif "canh-dieu" in fn_lower:
        tags.append("Cánh Diều")
    elif "kntt" in fn_lower or "knttvcs" in fn_lower:
        tags.append("Kết Nối Tri Thức")
        
    if "tiem-can" in fn_lower:
        tags.append("Đường tiệm cận")
    if "cuc-tri" in fn_lower:
        tags.append("Cực trị")
    if "don-dieu" in fn_lower:
        tags.append("Tính đơn điệu")
    if "gtln" in fn_lower or "gtnn" in fn_lower:
        tags.append("GTLN/GTNN")
    if "bien-thien" in fn_lower:
        tags.append("Biến thiên")
    if "thuc-te" in fn_lower:
        tags.append("Toán thực tế")
        
    return tags

def process_file():
    documents = []
    with open(source_file, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    idx = 1
    for line in lines:
        url = line.strip()
        if not url:
            continue
        filename = url.split("/")[-1]
        decoded_filename = urllib.parse.unquote(filename)
        
        title = clean_filename_to_title(decoded_filename)
        category = get_category(decoded_filename)
        tags = get_tags(decoded_filename)
        
        documents.append({
            "id": idx,
            "title": title,
            "filename": decoded_filename,
            "url": url,
            "category": category,
            "tags": tags
        })
        idx += 1
        
    # Build the multi-subject database structure
    subjects = [
        {
            "id": "khao-sat-ham-so",
            "name": "Giải Tích 12: Khảo Sát Hàm Số",
            "description": "Tổng hợp chuyên đề cực trị, tiệm cận, đơn điệu, GTLN/GTNN và khảo sát đồ thị hàm số chương trình mới.",
            "icon": "line-chart",
            "count": len(documents),
            "active": True,
            "documents": documents
        },
        {
            "id": "hinh-hoc-12",
            "name": "Hình Học 12: Thể Tích & Oxyz",
            "description": "Tài liệu chuyên đề thể tích đa diện, khối tròn xoay và hệ trục tọa độ trong không gian Oxyz.",
            "icon": "box",
            "count": 0,
            "active": False,
            "documents": []
        },
        {
            "id": "vat-ly-12",
            "name": "Vật Lý 12: Dao Động & Sóng Cơ",
            "description": "Bộ đề thi thử và tài liệu ôn tập chương Dao động điều hòa, Sóng cơ, Dòng điện xoay chiều.",
            "icon": "zap",
            "count": 0,
            "active": False,
            "documents": []
        },
        {
            "id": "hoa-hoc-12",
            "name": "Hóa Học 12: Hữu Cơ & Vô Cơ",
            "description": "Tài liệu bài giảng và bộ câu hỏi trắc nghiệm chương Este - Lipit, Cacbohidrat, Amin.",
            "icon": "flask-conical",
            "count": 0,
            "active": False,
            "documents": []
        }
    ]
        
    with open("d:/de-thi/data.js", "w", encoding="utf-8") as out:
        out.write("const subjectsData = ")
        out.write(json.dumps(subjects, ensure_ascii=False, indent=2))
        out.write(";\n")
        
    print(f"Successfully processed {len(documents)} docs into multi-subject structure inside data.js!")

if __name__ == "__main__":
    process_file()
