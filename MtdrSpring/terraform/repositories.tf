resource "oci_artifacts_container_repository" api_service {
  #Required
  compartment_id = var.ociCompartmentOcid
  display_name = "${var.runName}/${var.mtdrKey}/api-service"
  is_public = true
}

resource "oci_artifacts_container_repository" bot_service {
  #Required
  compartment_id = var.ociCompartmentOcid
  display_name = "${var.runName}/${var.mtdrKey}/bot-service"
  is_public = true
}

resource "oci_artifacts_container_repository" frontend_service {
  #Required
  compartment_id = var.ociCompartmentOcid
  display_name = "${var.runName}/${var.mtdrKey}/frontend-service"
  is_public = true
}