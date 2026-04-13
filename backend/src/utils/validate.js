export async function validarCampos(Model, dados) {
  try {
    await Model.build(dados).validate();
    return [];
  } catch (err) {
    return err.errors.map((e) => e.message);
  }
}
