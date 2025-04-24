import { Result, ok, err } from "../../shared/kernel/result";
import { ValidationErr } from "../../shared/kernel/types";
import { OrgId } from "../valueObjects/prompt/UserMeta";

export interface Organization {
  id: OrgId;
  name: string;
  description?: string;
}

interface CreateOrganizationArgs {
  id: string;
  name: string;
  description?: string;
}

export const createOrganization = ({
  id,
  name,
  description,
}: CreateOrganizationArgs): Result<Organization, ValidationErr> => {
  if (!id || id.trim().length === 0) {
    return err({ kind: "InvalidOrgId", raw: id });
  }

  if (!name || name.trim().length === 0) {
    return err({ kind: "InvalidOrgName", raw: name });
  }

  return ok({
    id: id as OrgId,
    name: name.trim(),
    description: description?.trim(),
  });
};
