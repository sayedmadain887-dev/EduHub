import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import FolderIcon from "@mui/icons-material/Folder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";

import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import styles from "./Materials.module.css";

function Materials() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [grades, setGrades] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState(null);
  const [openPdf, setOpenPdf] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    grade: "",
    description: "",
    order: "",
  });
  const [pdfFile, setPdfFile] = useState(null);

  const [showAddGradeForm, setShowAddGradeForm] = useState(false);
  const [newGradeName, setNewGradeName] = useState("");

  const [gradeToDelete, setGradeToDelete] = useState(null);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  /* ---------------- Fetch Grades on Load ---------------- */
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get("/materials/grades");
        setGrades(res.data);
      } catch (error) {
        console.error("Fetch Grades Error:", error.message);
      }
    };

    fetchGrades();
  }, []);

  /* ---------------- Fetch Materials When a Grade Is Opened ---------------- */
  useEffect(() => {
    if (!selectedGrade) return;

    const fetchMaterials = async () => {
      try {
        const res = await api.get(`/materials/grade/${selectedGrade._id}`);
        setMaterials(res.data);
      } catch (error) {
        console.error("Fetch Materials Error:", error.message);
      }
    };

    fetchMaterials();
  }, [selectedGrade]);

  /* ---------------- Admin: Add / Delete Grade Folders ---------------- */
  const handleAddGrade = async (e) => {
    e.preventDefault();
    const trimmedName = newGradeName.trim();
    if (!trimmedName) return;

    try {
      const res = await api.post("/materials/grades", { name: trimmedName });
      setGrades([...grades, res.data.grade]);
      setNewGradeName("");
      setShowAddGradeForm(false);
    } catch (error) {
      alert(error.response?.data?.message || "حصل خطأ أثناء إضافة الصف");
    }
  };

  const requestDeleteGrade = (grade, e) => {
    e.stopPropagation();
    setGradeToDelete(grade);
  };

  const confirmDeleteGrade = async () => {
    if (!gradeToDelete?._id) {
      alert("مفيش صف محدد للحذف");
      return;
    }

    try {
      await api.delete(`/materials/grades/${gradeToDelete._id}`);
      setGrades(grades.filter((g) => g._id !== gradeToDelete._id));
      setGradeToDelete(null);
    } catch (error) {
      alert(error.response?.data?.message || "حصل خطأ أثناء الحذف");
    }
  };

  /* ---------------- Admin: Add Material (with PDF upload) ---------------- */
  const handleNewMaterialChange = (e) => {
    setNewMaterial({ ...newMaterial, [e.target.name]: e.target.value });
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      alert("لازم ترفع ملف PDF");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newMaterial.name);
      formData.append("grade", newMaterial.grade);
      formData.append("description", newMaterial.description);
      formData.append("order", newMaterial.order);
      formData.append("pdf", pdfFile);

      const res = await api.post("/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Only add it to the visible list if we're currently viewing that grade.
      if (selectedGrade && selectedGrade._id === newMaterial.grade) {
        setMaterials([...materials, res.data.material]);
      }

      setNewMaterial({ name: "", grade: "", description: "", order: "" });
      setPdfFile(null);
      setShowAddForm(false);
    } catch (error) {
      alert(error.response?.data?.message || "حصل خطأ أثناء إضافة الملزمة");
    }
  };

  /* ---------------- Admin: Delete Material ---------------- */
  const requestDeleteMaterial = (material, e) => {
    e.stopPropagation();
    setMaterialToDelete(material);
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete?._id) {
      alert("مفيش مادة محددة للحذف");
      return;
    }

    try {
      await api.delete(`/materials/${materialToDelete._id}`);
      setMaterials(materials.filter((m) => m._id !== materialToDelete._id));
      setMaterialToDelete(null);
    } catch (error) {
      alert(error.response?.data?.message || "حصل خطأ أثناء حذف الملزمة");
    }
  };

  /* ---------------- Navigation ---------------- */
  const openFolder = (grade) => setSelectedGrade(grade);
  const goBackToFolders = () => {
    setSelectedGrade(null);
    setMaterials([]);
  };

  const openPdfViewer = (material) => setOpenPdf(material);
  const closePdfViewer = () => setOpenPdf(null);

  const handleContextMenu = (e) => e.preventDefault();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ---------- Page Header ---------- */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>الملازم التعليمية</h1>
          <p className={styles.pageSubtitle}>
            كل ملازمك منظمة حسب الصف الدراسي
          </p>

          {isAdmin && !selectedGrade && (
            <div className={styles.adminHeaderActions}>
              <button
                className={styles.addBtn}
                onClick={() => setShowAddGradeForm((prev) => !prev)}
              >
                <AddIcon fontSize="small" />
                <span>{showAddGradeForm ? "إلغاء" : "إضافة صف جديد"}</span>
              </button>
            </div>
          )}
        </div>

        {/* ---------- Admin: Add Grade Folder Form ---------- */}
        {isAdmin && showAddGradeForm && (
          <form className={styles.addForm} onSubmit={handleAddGrade}>
            <div className={styles.formRow}>
              <input
                type="text"
                placeholder="اسم الصف الدراسي (مثال: خامسة ابتدائي)"
                value={newGradeName}
                onChange={(e) => setNewGradeName(e.target.value)}
                className={styles.formInput}
                required
              />
              <button type="submit" className={styles.submitFormBtnSmall}>
                إضافة
              </button>
            </div>
          </form>
        )}

        {/* ---------- Folders View ---------- */}
        {!selectedGrade && (
          <>
            {grades.length === 0 ? (
              <p className={styles.emptyText}>مفيش صفوف مضافة لسه</p>
            ) : (
              <div className={styles.foldersGrid}>
                {grades.map((grade) => (
                  <div
                    key={grade._id}
                    className={styles.folderCard}
                    onClick={() => openFolder(grade)}
                  >
                    {isAdmin && (
                      <button
                        className={styles.deleteGradeBtn}
                        onClick={(e) => requestDeleteGrade(grade, e)}
                        aria-label="حذف الصف"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    )}

                    <FolderIcon className={styles.folderIcon} />
                    <h3 className={styles.folderName}>{grade.name}</h3>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------- Inside Folder: Materials List ---------- */}
        {selectedGrade && (
          <div className={styles.folderContent}>
            <button className={styles.backBtn} onClick={goBackToFolders}>
              <ArrowBackIcon fontSize="small" />
              <span>رجوع للصفوف</span>
            </button>

            <h2 className={styles.folderTitle}>{selectedGrade.name}</h2>

            {isAdmin && (
              <button
                className={styles.addBtn}
                onClick={() => {
                  setNewMaterial({ ...newMaterial, grade: selectedGrade._id });
                  setShowAddForm((prev) => !prev);
                }}
              >
                <AddIcon fontSize="small" />
                <span>{showAddForm ? "إلغاء" : "إضافة ملزمة جديدة"}</span>
              </button>
            )}

            {/* ---------- Admin: Add Material Form ---------- */}
            {isAdmin && showAddForm && (
              <form className={styles.addForm} onSubmit={handleAddMaterial}>
                <input
                  type="text"
                  name="name"
                  placeholder="اسم الملزمة"
                  value={newMaterial.name}
                  onChange={handleNewMaterialChange}
                  className={styles.formInput}
                  required
                />

                <textarea
                  name="description"
                  placeholder="وصف مختصر (اختياري)"
                  value={newMaterial.description}
                  onChange={handleNewMaterialChange}
                  className={styles.formTextarea}
                  rows={2}
                />

                <input
                  type="number"
                  name="order"
                  placeholder="ترتيب الظهور (رقم، أقل رقم يظهر أول)"
                  value={newMaterial.order}
                  onChange={handleNewMaterialChange}
                  className={styles.formInput}
                  min="1"
                />

                <div className={styles.fileInputWrapper}>
                  <label className={styles.fileLabel}>
                    اختار ملف PDF من جهازك
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      className={styles.fileInput}
                      required
                    />
                  </label>
                  {pdfFile && (
                    <span className={styles.fileName}>{pdfFile.name}</span>
                  )}
                </div>

                <button type="submit" className={styles.submitFormBtn}>
                  إضافة الملزمة
                </button>
              </form>
            )}

            {materials.length === 0 ? (
              <p className={styles.emptyText}>مفيش ملازم هنا لسه</p>
            ) : (
              <div className={styles.materialsList}>
                {materials.map((material) => (
                  <div
                    key={material._id}
                    className={styles.materialRow}
                    onClick={() => openPdfViewer(material)}
                  >
                    <div className={styles.materialIconWrapper}>
                      <PictureAsPdfIcon className={styles.pdfIcon} />
                    </div>

                    <div className={styles.materialInfo}>
                      <p className={styles.materialName}>{material.name}</p>
                      {material.description && (
                        <p className={styles.materialDescription}>
                          {material.description}
                        </p>
                      )}
                    </div>

                    <span className={styles.materialDate}>
                      {new Date(material.createdAt).toLocaleDateString("ar-EG")}
                    </span>

                    {isAdmin && (
                      <button
                        className={styles.deleteMaterialBtn}
                        onClick={(e) => requestDeleteMaterial(material, e)}
                        aria-label="حذف الملزمة"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- Embedded PDF Viewer Modal with Download Button ---------- */}
      {openPdf && (
        <div className={styles.pdfOverlay} onClick={closePdfViewer}>
          <div
            className={styles.pdfModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.pdfHeader}>
              <h3 className={styles.pdfTitle}>{openPdf.name}</h3>
              <button className={styles.closePdfBtn} onClick={closePdfViewer}>
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {/* ---------- Action Buttons ---------- */}
            <div className={styles.pdfActions}>
              <a
                href={openPdf.pdfUrl}
                download={`${openPdf.name}.pdf`}
                className={styles.downloadBtn}
              >
                <DownloadIcon fontSize="small" />
                <span>تحميل</span>
              </a>

              <a
                href={openPdf.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewBtn}
              >
                <VisibilityIcon fontSize="small" />
                <span>فتح في تبويب جديد</span>
              </a>
            </div>

            {/* ---------- PDF Viewer ---------- */}
            <div
              className={styles.pdfFrameWrapper}
              onContextMenu={handleContextMenu}
            >
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(openPdf.pdfUrl)}&embedded=true`}
                title={openPdf.name}
                className={styles.pdfFrame}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------- Delete Grade Confirmation ---------- */}
      <ConfirmModal
        isOpen={!!gradeToDelete}
        title="حذف الصف الدراسي"
        message={`متأكد إنك عايز تمسح "${gradeToDelete?.name}"؟ كل الملازم اللي جواه هتتمسح كمان (بما فيها ملفاتها الفعلية) ومينفعش ترجع تاني.`}
        confirmText="حذف"
        onConfirm={confirmDeleteGrade}
        onCancel={() => setGradeToDelete(null)}
      />

      {/* ---------- Delete Material Confirmation ---------- */}
      <ConfirmModal
        isOpen={!!materialToDelete}
        title="حذف الملزمة"
        message={`متأكد إنك عايز تمسح "${materialToDelete?.name}"؟`}
        confirmText="حذف"
        onConfirm={confirmDeleteMaterial}
        onCancel={() => setMaterialToDelete(null)}
      />
    </div>
  );
}

export default Materials;


     

 