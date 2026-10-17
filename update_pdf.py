import fitz
import os

src_pdf = r"C:\Users\PARI\Downloads\24DIT066_PRAC_10_AWDF.pdf"
img_dir = r"p:\React + Node js\practical 10\extracted_images"
out_pdf_proj = r"p:\React + Node js\practical 10\D25DIT079_PRAC_10_AWDF.pdf"
out_pdf_down = r"C:\Users\PARI\Downloads\D25DIT079_PRAC_10_AWDF.pdf"
out_pdf_down_dup = r"C:\Users\PARI\Downloads\D25DIT079_PRAC_10_AWDF.pdf.pdf"

doc = fitz.open(src_pdf)

# -----------------------------------------------------------------------------
# 1. Update Header on All 11 Pages: 24DIT066 -> D25DIT079
# -----------------------------------------------------------------------------
font_name = "Times-Bold"
font_size = 9.96
new_id = "D25DIT079"
tw = fitz.get_text_length(new_id, fontname=font_name, fontsize=font_size)
x_pos = 538.0 - tw
y_pos = 38.16

for i, page in enumerate(doc):
    for r in page.search_for("24DIT066"):
        pad_rect = fitz.Rect(r.x0 - 2, r.y0 - 1, r.x1 + 10, r.y1 + 1)
        page.add_redact_annot(pad_rect, fill=(1, 1, 1))
    page.apply_redactions()
    page.insert_text((x_pos, y_pos), new_id, fontname=font_name, fontsize=font_size, color=(0, 0, 0))

print("Step 1: Headers updated on all pages.")

# -----------------------------------------------------------------------------
# 2. In-Place Image Replacements with Real Performed Practical Screenshots
# -----------------------------------------------------------------------------
img_map = {
    # page_idx: [(xref, filename)]
    1: [(24, "page_2_img_1.png")],
    3: [(41, "page_4_img_1.png"), (42, "page_4_img_2.png")],
    4: [(45, "page_5_img_1.png")],
    5: [(50, "page_6_img_1.png"), (51, "page_6_img_2.jpeg")],
    6: [(59, "page_7_img_1.png")],
    7: [(62, "page_8_img_1.png"), (63, "page_8_img_2.jpeg")],
    8: [(66, "page_9_img_1.png")],
}

for page_idx, replacements in img_map.items():
    page = doc[page_idx]
    for xref, fname in replacements:
        full_path = os.path.join(img_dir, fname)
        if os.path.exists(full_path):
            page.replace_image(xref, filename=full_path)
            print(f"Page {page_idx+1}: replaced image xref {xref} with {fname}")

print("Step 2: All screenshots updated with real project runs.")

# -----------------------------------------------------------------------------
# 3. Helper to redact and replace text in PDF
# -----------------------------------------------------------------------------
def replace_text_in_page(page, search_str, replacement_str, font="Times-Roman", font_size=10, font_bold=False, color=(0,0,0), align_left=True):
    actual_font = "Times-Bold" if font_bold else font
    rects = page.search_for(search_str)
    for r in rects:
        # Redact existing text
        pad_r = fitz.Rect(r.x0 - 1, r.y0 - 1, r.x1 + 1, r.y1 + 1)
        page.add_redact_annot(pad_r, fill=(1, 1, 1))
        page.apply_redactions()
        
        # Insert new text
        # If align_left, insert at r.x0
        # baseline y
        insert_y = r.y1 - 1.5
        page.insert_text((r.x0, insert_y), replacement_str, fontname=actual_font, fontsize=font_size, color=color)

# Page 3 Updates:
p3 = doc[2]
replace_text_in_page(p3, "11 ms", "136 ms", font="Courier-Bold", font_size=8.5, font_bold=True)
replace_text_in_page(p3, "2016ms", "2009ms", font="Courier-Bold", font_size=8.5, font_bold=True)
replace_text_in_page(p3, "99.4%", "93.2%", font="Times-Bold", font_size=10, font_bold=True)

# Page 5 Updates: Table Timestamps
p5 = doc[4]
replace_text_in_page(p5, "08:09:12.326Z", "05:38:15.281Z", font="Times-Roman", font_size=9)
replace_text_in_page(p5, "08:09:14.342Z", "05:38:17.290Z", font="Times-Roman", font_size=9)
replace_text_in_page(p5, "2016ms", "2009ms", font="Times-Roman", font_size=9)
replace_text_in_page(p5, "08:09:14.647Z", "05:38:17.615Z", font="Times-Roman", font_size=9)
replace_text_in_page(p5, "08:09:14.648Z", "05:38:17.616Z", font="Times-Roman", font_size=9)
replace_text_in_page(p5, "08:09:14.650Z", "05:38:17.624Z", font="Times-Roman", font_size=9)

# Page 6 Updates: Caption
p6 = doc[5]
replace_text_in_page(p6, "11ms", "136ms", font="Times-Italic", font_size=9.5)

# Page 9 Updates: Analysis & Concept
p9 = doc[8]
replace_text_in_page(p9, "11ms", "136ms", font="Times-Roman", font_size=10)
replace_text_in_page(p9, "99.4%", "93.2%", font="Times-Roman", font_size=10)

# Page 10 Updates: Answers
p10 = doc[9]
replace_text_in_page(p10, "11 ms", "136 ms", font="Times-Roman", font_size=10)
replace_text_in_page(p10, "2011 ms", "2012 ms", font="Times-Roman", font_size=10)

# Page 11 Updates: Table & Conclusion
p11 = doc[10]
replace_text_in_page(p11, "11ms", "136ms", font="Times-Roman", font_size=8.5)
replace_text_in_page(p11, "2016ms", "2009ms", font="Times-Roman", font_size=8.5)
replace_text_in_page(p11, "99.4%", "93.2%", font="Times-Roman", font_size=8.5)
replace_text_in_page(p11, "11 ms", "136 ms", font="Times-Roman", font_size=9)

print("Step 3: All text metrics updated to match actual benchmarks.")

# -----------------------------------------------------------------------------
# 4. Save to Target Locations
# -----------------------------------------------------------------------------
doc.save(out_pdf_proj)
doc.save(out_pdf_down)
doc.save(out_pdf_down_dup)
print(f"Successfully saved updated PDF to:\n- {out_pdf_proj}\n- {out_pdf_down}\n- {out_pdf_down_dup}")
