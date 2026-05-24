type CameraConfig = string | { facingMode: "environment" };

/** Prefer rear camera on phones; fall back to facingMode constraint. */
export async function getBackCameraConfig(): Promise<CameraConfig> {
  try {
    const { Html5Qrcode } = await import("html5-qrcode");
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras.length) {
      return { facingMode: "environment" };
    }

    const backCamera = cameras.find((c) =>
      /back|rear|environment|trás|arrière/i.test(c.label)
    );
    if (backCamera) {
      return backCamera.id;
    }

    // On many phones the last listed camera is the rear camera.
    if (cameras.length > 1) {
      return cameras[cameras.length - 1].id;
    }

    return cameras[0].id;
  } catch {
    return { facingMode: "environment" };
  }
}
